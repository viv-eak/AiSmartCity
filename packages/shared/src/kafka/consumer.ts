import { Kafka, type EachMessagePayload } from "kafkajs";
import type { KafkaEvent } from "../types/events.js";

const kafka = new Kafka({
  clientId: "smart-city",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

export async function createConsumer(
  groupId: string,
  topic: string,
  handler: (event: KafkaEvent) => Promise<void>
): Promise<() => Promise<void>> {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString()) as KafkaEvent;
      try {
        await handler(event);
      } catch (err) {
        console.error(`Error processing event from ${topic}:`, err);
      }
    },
  });

  return async () => {
    await consumer.disconnect();
  };
}
