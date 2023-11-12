import "egg";

declare module "egg" {
  interface Application {
    backend: ShareDB;
    ShareDBConnection: any;
    sendMail: (mailOptions: any) => void;
    mysql: any;
  }
}

interface CustomController {
  nsp: any;
}

