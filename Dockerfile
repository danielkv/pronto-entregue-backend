FROM node:12-alpine

WORKDIR /usr/app

#install yarn
RUN ["apk", "add", "yarn"]

# copy files
COPY . .

# install dependences
RUN yarn

# build app
RUN ["yarn", "preinstall"]
RUN ["yarn", "build"]

# expose port
EXPOSE 4000

# run app
CMD ["yarn", "start"]