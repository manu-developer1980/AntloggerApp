---
name: "Skill: Event-Driven Architecture Basics"
description: "Purpose
  Introduce event-driven architecture concepts, components, and common use cases."
---

# Event-Driven Architecture Basics

## Overview

Services communicate by emitting and listening for events, rather than direct calls.

## Components

- **Producer**: Emits an event (e.g., "OrderPlaced").
- **Broker**: Routes events (e.g., RabbitMQ, Kafka, AWS SNS/SQS).
- **Consumer**: Reacts to the event (e.g., "SendEmail", "UpdateInventory").

## Benefits

- **Decoupling**: Producers don't know consumers.
- **Resilience**: If a consumer is down, events can be queued.
- **Scalability**: Add more consumers to process heavy loads.

## Challenges

- Eventual consistency.
- Debugging/Tracing flow.
