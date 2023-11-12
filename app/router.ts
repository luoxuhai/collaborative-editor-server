import { Application } from "egg";
import auth from "./middleware/authorization";

export default (app: Application) => {
  const { controller, router } = app;

  router.post(
    "/comments/createComment",
    auth(),
    controller.comment.createComment
  );
  router.get("/comments/queryComments", controller.comment.queryComments);
  router.get("/comments/queryReplyList", controller.comment.queryReplyList);
  router.delete(
    "/comments/deleteComment",
    auth(),
    controller.comment.deleteComment
  );

  router.post("/files/createFile", auth(), controller.file.createFile);
  router.delete("/files/deleteFile", auth(), controller.file.deleteFile);
  router.put("/files/updateFile", auth(), controller.file.updateFile);
  router.get(
    "/files/getFilesByParent",
    auth(),
    controller.file.getFilesByParent
  );
  router.get("/files/getFileById", auth(), controller.file.getFileById);
  router.get("/files/getFilesByName", auth(), controller.file.getFilesByName);
  router.get("/files/getStarFiles", auth(), controller.file.getStarFiles);
  router.put("/files/sharePermission", auth(), controller.file.sharePermission);

  router.get(
    "/collaboration/getCollaboration",
    auth(),
    controller.collaboration.getCollaboration
  );
  router.get(
    "/collaboration/getCollaborator",
    auth(),
    controller.collaboration.getCollaborator
  );
  router.put(
    "/collaboration/addCollaborator",
    auth(),
    controller.collaboration.addCollaborator
  );
  router.delete(
    "/collaboration/deleteCollaborator",
    auth(),
    controller.collaboration.deleteCollaborator
  );

  router.get("/trash/getTrashFiles", auth(), controller.trash.getTrashFiles);
  router.delete(
    "/trash/deleteTrashFile",
    auth(),
    controller.trash.deleteTrashFile
  );
  router.post(
    "/trash/restoreTrashFile",
    auth(),
    controller.trash.restoreTrashFile
  );

  router.post("/users/login", controller.user.login);
  router.put("/users/updateEmail", auth(), controller.user.updateEmail);
  router.get("/users/getUserInfoById", controller.user.getUserInfoById);
  router.post("/users/star", auth(), controller.user.star);
  router.get("/users/verify_code", controller.user.sendVerifyCode);
  router.get(
    "/users/getUserInfoByToken",
    auth(),
    controller.user.getUserInfoByToken
  );
  router.resources("user", "/users", controller.user);

  router.post("/editor/uploadImage", controller.editor.uploadImage);
};
