import { LogLvl } from "@dendronhq/common-server";
import express from "express";
import _ from "lodash";
import { configureLogger, getLogger } from "./core";

export { ServerUtils, SubProcessExitType } from "./utils";

type LaunchOpts = {
  port?: number;
  logPath?: string;
  logLevel?: LogLvl;
  nextServerUrl?: string;
  nextStaticRoot?: string;
  googleOauthClientId?: string;
  googleOauthClientSecret?: string;
};

export type ServerClose = ReturnType<
  typeof express["application"]["listen"]
>["close"];
export type Server = {
  close: ServerClose;
};

function launchv2(
  opts?: {} & LaunchOpts
): Promise<{ port: number; server: Server }> {
  const ctx = "launch";

  const listenPort = opts?.port || 0;
  const LOG_DST = opts?.logPath ? opts.logPath : "stdout";
  configureLogger({ logPath: LOG_DST });

  return new Promise((resolve) => {
    const appModule = require("./Server").appModule;
    const app = appModule({
      logPath: LOG_DST,
      nextServerUrl: opts?.nextServerUrl,
      nextStaticRoot: opts?.nextStaticRoot,
      googleOauthClientId: opts?.googleOauthClientId,
      googleOauthClientSecret: opts?.googleOauthClientSecret,
    });
    const server = app.listen(listenPort, () => {
      const port = (server.address() as any).port;
      getLogger().info({ ctx, msg: "exit", port, LOG_DST, root: __dirname });
      resolve({ port, server });
    });
  });
}
export { express, launchv2 };
