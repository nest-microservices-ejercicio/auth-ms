FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm install -g pnpm@10.27.0

RUN pnpm install

COPY . .

CMD ["pnpm", "start:dev"]