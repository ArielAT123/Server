import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  location: { 
    type: String,
    default: "Virtual" 
  },
  category: { 
    type: String,
    enum: ["Taller", "Conferencia", "Networking", "Ronda de Inversión"],
    required: true 
  },
  link: { 
    type: String, 
    validate: {
      validator: (url) => {
        return /^(http|https):\/\/[^ "]+$/.test(url);
      },
      message: "URL inválida"
    }
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  attendees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  image: { 
    type: String 
  },
  tags: [{ 
    type: String,
    lowercase: true 
  }],
  isFree: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

export const Event = mongoose.model("Event", EventSchema);