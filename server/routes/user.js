import express from "express";
import { authController, userController } from "../controllers/index.js";
const router = express.Router();

router
  .route("/update_user")
  .post(authController.authenticate, userController.updateUser);
router
  .route("/update_userAvatar")
  .post(authController.authenticate, userController.updateUserAvatar);
router
  .route("/get-users")
  .get(authController.authenticate, userController.getUsers);
router
  .route("/get-friendRequest")
  .get(authController.authenticate, userController.getFriendRequests);
router
  .route("/get-friends")
  .get(authController.authenticate, userController.getFriends);

router
  .route("/get-privateConversationList")
  .get(authController.authenticate, userController.getPrivateConversationsList);
router
  .route("/get-groupConversationList")
  .get(authController.authenticate, userController.getGroupConversationsList);

router
  .route("/get-privateConversation")
  .get(authController.authenticate, userController.getPrivateConversation); // uses search query
router
  .route("/get-groupConversation")
  .post(authController.authenticate, userController.getGroupConversation);

router
  .route("/get-deleteConversation")
  .get(authController.authenticate, userController.deleteConversation); // uses search query

router
  .route("/get-chatHistory")
  .get(authController.authenticate, userController.getChatHistory); // uses search query

router
  .route("/clearHistory")
  .get(authController.authenticate, userController.clearChatHistory); // uses search query

router
  .route("/get-commonGroups")
  .get(authController.authenticate, userController.getCommonGroups); // uses search query

router
  .route("/pinConversation")
  .post(authController.authenticate, userController.pinConversation);

router
  .route("/archiveConversation")
  .post(authController.authenticate, userController.archiveConversation);

router
  .route("/starMessage")
  .get(authController.authenticate, userController.starMessage); // uses search query

router
  .route("/deleteMessage")
  .get(authController.authenticate, userController.deleteMessage); // uses search query

router
  .route("/userInfo/:id")
  .get(authController.authenticate, userController.getUserInfo);
  
router.route("/groupInfo/:id").get(userController.getGroupInfo);  

export default router;
