import { Request } from "express";
import { WebSocket } from "ws";
import ServiceProvider from "./ServiceProvider";

interface EnhancedWebSocket extends WebSocket {
  sendText(data: any): void;
}

const handleWebsocketRequest = (ws: EnhancedWebSocket, req: Request) => {
  const {
    params: { id },
  } = req;
  const strategyManager = ServiceProvider.getInstance().strategyManager;

  ws.sendText = (data: any) => ws.send(JSON.stringify(data));

  strategyManager.channelLiveActivity(id, ws);
};

export default handleWebsocketRequest;
