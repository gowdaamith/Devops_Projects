const express = require("express");
const { Kafka } = require("kafkajs");
const client = require("prom-client");

const app = express();
app.use(express.json());

/* ---------------- PROMETHEUS METRICS ---------------- */

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const requestCounter = new client.Counter({
  name: "app_requests_total",
  help: "Total number of requests"
});

/* ---------------- KAFKA SETUP ---------------- */

const kafka = new Kafka({
  clientId: "devops-demo",
  brokers: ["kafka:9092"]   // this will match the kafka service in Kubernetes
});

const producer = kafka.producer();

async function startKafka() {
  await producer.connect();
  console.log("Connected to Kafka");
}

startKafka();

/* ---------------- ROUTES ---------------- */

app.get("/", (req, res) => {
  requestCounter.inc();
  res.send("DevOps Demo Application Running");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/order", async (req, res) => {

  const order = {
    product: req.body.product,
    price: req.body.price,
    time: new Date().toISOString()
  };

  try {

    await producer.send({
      topic: "orders",
      messages: [
        { value: JSON.stringify(order) }
      ]
    });

    res.json({
      message: "Order event sent to Kafka",
      order
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Kafka error");
  }

});

/* ---------------- PROMETHEUS METRICS ---------------- */

app.get("/metrics", async (req, res) => {

  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());

});

/* ---------------- SERVER ---------------- */

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
