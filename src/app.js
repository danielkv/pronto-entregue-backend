import 'dotenv/config';
import AppFactory  from './factory/app';

AppFactory.start();

AppFactory.startJobsProcessors();