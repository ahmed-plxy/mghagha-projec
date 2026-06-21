const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/user.repo');
const areaRepo = require('../repositories/area.repo');
const { isValidEgyptianPhone, isValidEmail, isValidPassword, isNonEmptyString, isValidFullName } = require('../utils/validators');
const { containsBannedWord } = require('../utils/blacklist');

function showLogin(req, res) {
  res.render('auth/login', { title: 'ادخل', errors: null, old: {} });
}

function showRegister(req, res) {
  const areas = areaRepo.findAllActive();
  res.render('auth/register', { title: 'افتح حساب', errors: null, old: {}, areas });
}

function login(req, res) {
  const { phone, password } = req.body;
  const errors = [];

  if (!isNonEmptyString(phone)) errors.push('رقم التليفون مطلوب.');
  if (!isNonEmptyString(password)) errors.push('كلمة السر مطلوبة.');

  if (errors.length > 0) {
    return res.status(400).render('auth/login', { title: 'ادخل', errors, old: { phone } });
  }

  const user = userRepo.findByPhone(phone.trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).render('auth/login', { title: 'ادخل', errors: ['رقم التليفون أو كلمة السر غلط.'], old: { phone } });
  }

  if (user.status === 'suspended') {
    return res.status(403).render('auth/login', { title: 'ادخل', errors: ['الحساب ده موقوف. تواصل مع الإدارة.'], old: { phone } });
  }

  req.session.user = { id: user.id, fullName: user.full_name, phone: user.phone, role: user.role };
  req.session.flash = { type: 'success', text: 'دخلت بنجاح. أهلاً بيك!' };

  if (user.role === 'admin') return res.redirect('/admin/dashboard');
  if (user.role === 'vendor') return res.redirect('/vendor/dashboard');
  return res.redirect('/');
}

function register(req, res) {
  const { fullName, phone, email, password, confirmPassword, areaId, agreeTerms } = req.body;
  const areas = areaRepo.findAllActive();
  const errors = [];

  if (!isValidFullName(fullName)) errors.push('حط اسمك الحقيقي (3 حروف على الأقل، بدون أرقام أو رموز).');
  else if (containsBannedWord(fullName)) errors.push('الاسم فيه كلمة ممنوعة.');
  if (!isValidEgyptianPhone(phone)) errors.push('رقم التليفون مش صح (مثال: 01012345678).');
  if (email && !isValidEmail(email)) errors.push('الإيميل مش صح.');
  if (!isValidPassword(password)) errors.push('كلمة السر لازم تكون 8 حروف على الأقل.');
  if (password !== confirmPassword) errors.push('كلمتين السر مش زي بعض.');
  if (!areaId) errors.push('اختار منطقتك أو قريتك.');
  if (!agreeTerms) errors.push('لازم توافق على سياسة الخصوصية واتفاقية البيع والشراء الأول.');

  if (errors.length === 0) {
    const existingPhone = userRepo.findByPhone(phone.trim());
    if (existingPhone) errors.push('رقم التليفون ده مستخدم.');

    if (isNonEmptyString(email)) {
      const existingEmail = userRepo.findByEmail(email.trim());
      if (existingEmail) errors.push('الإيميل ده مستخدم.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).render('auth/register', {
      title: 'افتح حساب', errors, old: { fullName, phone, email, areaId }, areas
    });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = userRepo.createUser({
    fullName: fullName.trim(),
    phone: phone.trim(),
    email: isNonEmptyString(email) ? email.trim() : null,
    passwordHash,
    role: 'customer'
  });

  req.session.user = { id: user.id, fullName: user.full_name, phone: user.phone, role: user.role };
  req.session.flash = { type: 'success', text: 'حسابك اتعمل بنجاح، منور في متجر مغاغة!' };
  return res.redirect('/');
}

function googleCallback(req, res) {
  if (!req.user) {
    return res.redirect('/auth/login?error=google');
  }
  const user = req.user;
  if (user.status === 'suspended') {
    return res.redirect('/auth/login?error=suspended');
  }
  req.session.user = { id: user.id, fullName: user.full_name, phone: user.phone, role: user.role };
  if (user.phone && user.phone.startsWith('google_')) {
    return res.redirect('/auth/complete-profile');
  }
  req.session.flash = { type: 'success', text: 'دخلت بحساب جوجل بنجاح. أهلاً بيك!' };
  if (user.role === 'admin') return res.redirect('/admin/dashboard');
  if (user.role === 'vendor') return res.redirect('/vendor/dashboard');
  return res.redirect('/');
}

function showCompleteProfile(req, res) {
  if (!req.session.user) return res.redirect('/auth/login');
  if (!req.session.user.phone || !req.session.user.phone.startsWith('google_')) {
    return res.redirect('/');
  }
  res.render('auth/complete-profile', { title: 'أكمل بياناتك', errors: null, old: {} });
}

function completeProfile(req, res) {
  if (!req.session.user) return res.redirect('/auth/login');
  if (!req.session.user.phone || !req.session.user.phone.startsWith('google_')) {
    return res.redirect('/');
  }

  const { phone } = req.body;
  const errors = [];

  if (!isValidEgyptianPhone(phone)) {
    errors.push('رقم التليفون مش صح (مثال: 01012345678).');
  }

  if (errors.length === 0) {
    const existing = userRepo.findByPhone(phone.trim());
    if (existing && existing.id !== req.session.user.id) {
      errors.push('رقم التليفون ده متسجل بالفعل على حساب تاني.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).render('auth/complete-profile', {
      title: 'أكمل بياناتك', errors, old: { phone }
    });
  }

  const updatedUser = userRepo.updatePhone(req.session.user.id, phone.trim());
  req.session.user = { ...req.session.user, phone: updatedUser.phone };
  req.session.flash = { type: 'success', text: 'بياناتك اتحفظت بنجاح. أهلاً بيك!' };
  return res.redirect('/');
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
}

module.exports = { showLogin, showRegister, login, register, googleCallback, showCompleteProfile, completeProfile, logout };
