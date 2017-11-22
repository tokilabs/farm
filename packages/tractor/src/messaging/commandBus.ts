import * as PubSub from 'pubsub-js';

import { ICommandSender, ICommand, IHandleCommand } from '@cashfarm/plow';

export interface ICommandBus {
  register<T extends ICommand>(cmdName: string, handler: IHandleCommand<T>): void;
}

export class CommandBus implements ICommandBus, ICommandSender {
  public register<T extends ICommand>(cmdName: string, handler: IHandleCommand<T>) {
    PubSub.subscribe(cmdName, handler.handle.bind(handler));
  }

  public send(cmd: ICommand) {
    PubSub.publishSync(cmd.name, cmd);
  }
}

export default new CommandBus();
