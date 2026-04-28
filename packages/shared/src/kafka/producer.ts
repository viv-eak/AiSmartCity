import { Kafka, Producer } from "kafkajs";
import type { KafkaEvent } from "../types/events.js";

let producer: Producer | null = null;

const kafka = new Kafka({
  clientId: "smart-city",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

export async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
  }
  return producer;
}

export async function publishEvent(
  topic: string,
  event: KafkaEvent,
  key?: string
): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic,
    messages: [
      {
        key: key || null,
        value: JSON.stringify(event),
      },
    ],
  });
}

export async function disconnectProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
}
