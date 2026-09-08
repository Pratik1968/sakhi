import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly expo = new Expo();

  /**
   * Send a push notification to a set of Expo push tokens. Invalid tokens are
   * skipped. Failures are logged but never throw (push is best-effort).
   */
  async sendPush(
    tokens: (string | null | undefined)[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const messages: ExpoPushMessage[] = [];
    for (const token of tokens) {
      if (!token || !Expo.isExpoPushToken(token)) continue;
      messages.push({ to: token, sound: 'default', title, body, data, priority: 'high' });
    }
    if (messages.length === 0) return;

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        this.logger.error(`Expo push failed: ${(err as Error).message}`);
      }
    }
  }
}
