import repositoryContacts from '../../repository/contacts';
import repositoryUsers from '../../repository/users';
import { HttpCode } from '../../lib/constants';
import {
  UploadFileStorage,
  LocalFileStorage,
  CloudFileStorage,
} from '../../service/file-storage';
import {
  EmailService,
  SenderNodemailer,
  SenderSendGrid,
} from '../../service/email';
import { CustomError } from '../../lib/custom-error';

const aggregation = async (req, res, next) => {
  const { id } = req.params;
  const data = await repositoryContacts.getStatisticsContacts(id);
  if (data) {
    return res
      .status(HttpCode.OK)
      .json({ status: 'success', code: HttpCode.OK, data });
  }
  throw new CustomError(HttpCode.NOT_FOUND, 'Not Found');
};

const uploadAvatar = async (req, res, next) => {
  const uploadService = new UploadFileStorage(
    CloudFileStorage,
    req.file,
    req.user
  );

  const avatarUrl = await uploadService.updateAvatar();

  res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    data: { avatarUrl },
  });
};

const verifyUser = async (req, res, next) => {
  const verifyToken = req.params.token;
  const userFromToken = await repositoryUsers.findByVerifyToken(verifyToken);

  if (userFromToken) {
    await repositoryUsers.updateVerify(userFromToken.id, true);
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: { message: 'Success' },
    });
  }
  throw new CustomError(HttpCode.BAD_REQUEST, 'Invalid token');
};

const repeatEmailForVerifyUser = async (req, res, next) => {
  const { email } = req.body;
  const user = await repositoryUsers.findByEmail(email);
  if (user) {
    const { email, name, verifyTokenEmail } = user;
    const emailService = new EmailService(
      process.env.NODE_ENV,
      new SenderNodemailer()
    );

    const isSend = await emailService.sendVerifyEmail(
      email,
      name,
      verifyTokenEmail
    );
    if (isSend) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: { message: 'Success' },
      });
    }
    throw new CustomError(HttpCode.SERVICE_UNAVAILABLE, 'Service Unavailable');
  }
  throw new CustomError(HttpCode.NOT_FOUND, 'User with email not found');
};

export { aggregation, uploadAvatar, verifyUser, repeatEmailForVerifyUser };
