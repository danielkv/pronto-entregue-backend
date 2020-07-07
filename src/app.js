import 'dotenv/config';
import AppService  from './factory/app';

AppService.start();

AppService.startJobsProcessors();