// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportCollaboration from '../../../app/controller/collaboration';
import ExportComment from '../../../app/controller/comment';
import ExportEditor from '../../../app/controller/editor';
import ExportFile from '../../../app/controller/file';
import ExportTrash from '../../../app/controller/trash';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    collaboration: ExportCollaboration;
    comment: ExportComment;
    editor: ExportEditor;
    file: ExportFile;
    trash: ExportTrash;
    user: ExportUser;
  }
}
