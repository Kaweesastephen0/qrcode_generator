import mongoose from 'mongoose';
import QRCode from '../models/QRCode.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const NGROK_URL = process.env.NGROK_URL || 'https://unmoving-lucca-pseudoeconomically.ngrok-free.dev';

async function updateQRCodes() {
  try {
    console.log('Updating QR codes to use ngrok URL:', NGROK_URL);
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get all QR codes
    const qrCodes = await QRCode.find({});
    
    console.log(`Found ${qrCodes.length} QR codes to update`);
    
    // Update each QR code
    for (const qrCode of qrCodes) {
      const newQrLink = `${NGROK_URL}/card/${qrCode.profileId}`;
      const newQrData = await import('qrcode').then(module => 
        module.toDataURL(newQrLink)
      );
      
      qrCode.qrCodeData = newQrLink;
      qrCode.qrCodeUrl = newQrData;
      
      await qrCode.save();
      console.log(`Updated QR code ${qrCode._id}: ${qrCode.profileId}`);
    }
    
    console.log('QR codes updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating QR codes:', error);
    process.exit(1);
  }
}

updateQRCodes();
