import { Request } from "express";
import { WebSocket } from "ws";

interface EnhancedWebSocket extends WebSocket {
  sendText(data: any): void;
}

const handleWebsocketRequest = (ws: EnhancedWebSocket, req: Request) => {
  const {
    strategyManager,
    params: { id }
  } = req;

  ws.sendText = (data: any) => ws.send(JSON.stringify(data));

  strategyManager.channelLiveActivity(id, ws);
};

export default handleWebsocketRequest;