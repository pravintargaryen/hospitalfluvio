// index.ts
import express, { Request, Response } from "express";
import Fluvio, { Offset, Record } from "@fluvio/client";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

const TOPIC_NAME = "quotes";
const PARTITION = 0;

// Enable CORS for all routes
app.use(cors());
app.use(express.static("public"));

//Create Fluvio Client Instance
const fluvio = new Fluvio();

//API Endpoint to Consume Messages
app.get("/consume", async (req: Request, res: Response) => {
  try {
    console.log("Connecting client to Fluvio");
    await fluvio.connect();

    // Create a partition consumer
    const consumer = await fluvio.partitionConsumer(TOPIC_NAME, PARTITION);

    // Stream messages from the end of the topic
    const messages: string[] = [];
    await consumer.stream(Offset.FromEnd(), async (record: Record) => {
      const message = `${record.valueString()}`;
      messages.push(message);
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error consuming messages:", error);
    res.status(500).send("Failed to consume messages");
  }
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/blood", (req, res) => {
  res.render("blood.ejs");
});

app.get("/pharmacy", (req, res) => {
  res.render("pharmacy.ejs");
});

// Start the Express Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
