import {
  Body,
  Controller,
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { AssistantsService } from './assistants.service';
import { QuestionDto } from './dtos/question.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { unlink } from 'fs/promises';

@Controller('assistants')
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) {}

  @Post('create-thread')
  async createThread() {
    return await this.assistantsService.createThread();
  }

  @Post('create-thread-audio')
  async createThreadAudio() {
    return await this.assistantsService.createThreadAudio();
  }

  @Post('user-question')
  async userQuestion(@Body() questionDto: QuestionDto) {
    return await this.assistantsService.userQuestion(questionDto);
  }

  @Post('conversation')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './generated/uploads/audio',
        filename: (req, file, callback) => {
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${new Date().getTime()}.${fileExtension}`;
          return callback(null, fileName);
        },
      }),
    }),
  )
  async continueAudioConversation(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1000 * 1024 * 5,
            message: 'File is bigger than 5 mb ',
          }),
          new FileTypeValidator({ fileType: 'audio/*' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('threadId') threadId: string,
    @Res() res: Response,
  ) {
    const filePath = await this.assistantsService.continueAudioConversation(
      file,
      threadId,
    );

    // Eliminar el archivo después de procesarlo
    await unlink(file.path);

    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }
}
