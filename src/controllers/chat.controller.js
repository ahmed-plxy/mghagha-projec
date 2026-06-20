const conversationRepo = require('../repositories/conversation.repo');
const messageRepo = require('../repositories/message.repo');
const storeRepo = require('../repositories/store.repo');
const notificationService = require('../services/notification.service');
const { isNonEmptyString } = require('../utils/validators');
const path = require('path');
const fs = require('fs');

let bannedWords = [];
try {
  const bwPath = path.join(__dirname, '..', '..', 'data', 'banned-words.json');
  bannedWords = JSON.parse(fs.readFileSync(bwPath, 'utf8'));
} catch (e) {}

function checkBannedWords(text) {
  const lower = text.toLowerCase();
  return bannedWords.find(w => lower.includes(w.toLowerCase())) || null;
}

function list(req, res) {
  const conversations = conversationRepo.findByCustomer(req.session.user.id);
  res.render('customer/messages/list', { title: 'الرسائل', conversations });
}

function start(req, res) {
  const { storeId, productName, productUrl } = req.body;
  const store = storeRepo.findById(storeId);

  if (!store || store.status !== 'active') {
    req.session.flash = { type: 'error', text: 'المحل ده مش متاح دلوقتي.' };
    return res.redirect('/stores');
  }

  const conversation = conversationRepo.findOrCreate(req.session.user.id, store.id);

  if (productName) {
    const autoMsg = productUrl
      ? `أهلاً، أنا مهتم بالمنتج ده: ${productName}\n${productUrl}`
      : `أهلاً، أنا مهتم بالمنتج ده: ${productName}`;
    messageRepo.create(conversation.id, req.session.user.id, autoMsg);
    conversationRepo.touchLastMessage(conversation.id);
    notificationService.notifyNewMessage(
      store.owner_user_id,
      `/vendor/messages/${conversation.id}`,
      req.session.user.fullName
    );
  }

  res.redirect(`/customer/messages/${conversation.id}`);
}

function view(req, res) {
  const conversation = conversationRepo.findById(Number(req.params.id));

  if (!conversation || conversation.customer_id !== req.session.user.id) {
    req.session.flash = { type: 'error', text: 'المحادثة مش موجودة أو معكش صلاحية تدخل فيها.' };
    return res.redirect('/customer/messages');
  }

  messageRepo.markConversationRead(conversation.id, req.session.user.id);
  const messages = messageRepo.findByConversation(conversation.id);
  const store = storeRepo.findById(conversation.store_id);

  res.render('customer/messages/conversation', {
    title: 'محادثة مع ' + store.store_name,
    conversation,
    store,
    messages
  });
}

function send(req, res) {
  const conversation = conversationRepo.findById(Number(req.params.id));

  if (!conversation || conversation.customer_id !== req.session.user.id) {
    req.session.flash = { type: 'error', text: 'المحادثة مش موجودة أو معكش صلاحية تدخل فيها.' };
    return res.redirect('/customer/messages');
  }

  const { body } = req.body;
  if (!isNonEmptyString(body)) {
    return res.redirect(`/customer/messages/${conversation.id}`);
  }

  const trimmed = body.trim();
  const hitWord = checkBannedWords(trimmed);
  if (hitWord && !conversation.is_flagged) {
    conversationRepo.flagConversation(conversation.id, `كلمة مشبوهة: "${hitWord}"`);
  }

  messageRepo.create(conversation.id, req.session.user.id, trimmed);
  conversationRepo.touchLastMessage(conversation.id);

  const store = storeRepo.findById(conversation.store_id);
  notificationService.notifyNewMessage(
    store.owner_user_id,
    `/vendor/messages/${conversation.id}`,
    req.session.user.fullName
  );

  res.redirect(`/customer/messages/${conversation.id}`);
}

module.exports = { list, start, view, send };
