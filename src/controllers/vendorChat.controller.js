const conversationRepo = require('../repositories/conversation.repo');
const messageRepo = require('../repositories/message.repo');
const userRepo = require('../repositories/user.repo');
const notificationService = require('../services/notification.service');
const { isNonEmptyString } = require('../utils/validators');
const { containsBannedWord } = require('../utils/blacklist');

function list(req, res) {
  const conversations = conversationRepo.findByStore(req.store.id);
  res.render('vendor/messages/list', { title: 'الرسائل', conversations });
}

function view(req, res) {
  const conversation = conversationRepo.findById(Number(req.params.id));

  if (!conversation || conversation.store_id !== req.store.id) {
    req.session.flash = { type: 'error', text: 'المحادثة غير موجودة أو لا تملك صلاحية الوصول إليها.' };
    return res.redirect('/vendor/messages');
  }

  messageRepo.markConversationRead(conversation.id, req.session.user.id);
  const messages = messageRepo.findByConversation(conversation.id);
  const customer = userRepo.findById(conversation.customer_id);

  res.render('vendor/messages/conversation', {
    title: 'محادثة مع ' + customer.full_name,
    conversation,
    customer,
    messages
  });
}

function send(req, res) {
  const conversation = conversationRepo.findById(Number(req.params.id));

  if (!conversation || conversation.store_id !== req.store.id) {
    req.session.flash = { type: 'error', text: 'المحادثة غير موجودة أو لا تملك صلاحية الوصول إليها.' };
    return res.redirect('/vendor/messages');
  }

  const { body } = req.body;
  if (!isNonEmptyString(body)) {
    return res.redirect(`/vendor/messages/${conversation.id}`);
  }

  const trimmed = body.trim();

  if (containsBannedWord(trimmed)) {
    req.session.flash = { type: 'error', text: 'الرسالة دي فيها كلام ممنوع ومش هتتبعت.' };
    return res.redirect(`/vendor/messages/${conversation.id}`);
  }

  messageRepo.create(conversation.id, req.session.user.id, trimmed);
  conversationRepo.touchLastMessage(conversation.id);

  notificationService.notifyNewMessage(
    conversation.customer_id,
    `/customer/messages/${conversation.id}`,
    req.store.store_name
  );

  res.redirect(`/vendor/messages/${conversation.id}`);
}

module.exports = { list, view, send };
