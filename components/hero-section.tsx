"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, FileText, ImageIcon } from "lucide-react";
import { Loader2 } from "lucide-react";


type InvoiceData = {
  invoice_details: {
    invoice_no: string;
    date: string;
  };
  seller_details: {
    name: string;
    address: string;
  };
  issued_to: {
    name: string;
    address: string;
    email?: string;
  };
  summary: {
    total: number;
    subtotal?: number;
    tax?: number;
    shipping?: number;
  };
};


export function HeroSection() {

const normalizeInvoiceData = (data: any): InvoiceData => {
  
  // Helper function to build address string
   const formatAddress = (addr: any): string => {
      if (!addr) return 'N/A';

      // Support many field name variants and fragments
      const parts = [
        addr.street || addr.address_line1 || addr.address1 || addr.line1,
        addr.address_line2 || addr.address2 || addr.unit || addr.po_box,
        addr.city,
        addr.state,
        addr.zip || addr.postal_code || addr.postcode
      ]
        .filter(Boolean)
        .map((s: string) => s.trim());

      if (parts.length === 0) return 'N/A';

      // If address_line2 already contains city/state/zip, avoid duplicating by removing contained fragments
      const condensed: string[] = [];
      for (const p of parts) {
        const lower = p.toLowerCase();
        if (!condensed.some(c => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase()))) {
          condensed.push(p);
        }
      }

      return condensed.join(', ').replace(/\s+,/g, ',').replace(/,+\s*,/g, ',').trim();
    };

  // Helper function to get the first valid value
  const getFirstValid = (...values: any[]): any => 
    values.find(v => v !== undefined && v !== null) ?? 'N/A';

  return {
    invoice_details: {      //Invoice Details
      invoice_no: getFirstValid(
        data.invoice_details?.invoice_no,
        data.invoice_details?.invoice_number,
        data.order_details?.order_number,
        data.order_number,
        'N/A'
      ),
      date: getFirstValid(
        data.invoice_details?.date,
        data.invoice_details?.invoice_date,
        data.order_details?.order_placed_date,
        data.order_details?.order_date,
        data.date,
        'N/A'
      ),
    },



    seller_details: {         //Seller Details
      name: getFirstValid(
        data.seller_details?.name,
        data.sold_by?.name,
        data.seller_details?.seller_name,
        data.order_details?.sold_by,
        data.sold_by,
        'N/A'
      ),
      address: (name => {
        if (name === 'N/A') return 'Online Seller';
        
        return getFirstValid(
          data.seller_details?.address,
          data.sold_by?.address,
          data.seller_details?.name,
        data.order_details?.sold_by,
        data.sold_by,
          formatAddress(data.seller_details),
          formatAddress(data.order_details?.sold_by_address),
          'Online Seller'
        );
      })(getFirstValid(
        data.seller_details?.name,
        data.order_details?.sold_by,
        data.sold_by,
        'Online Seller'
      )),
    },



    issued_to: {         //Issued To  
  name: getFirstValid(
    data.issued_to?.name,
    data.shipping_address?.name,
    data.order_details?.shipping_address?.name,
    data.billing_address?.name,
    'N/A'
  ),
   address: (() => {
        const fullAddress = getFirstValid(
          data.issued_to?.address,
          data.billing_address?.address,
          data.shipping_address?.address,
          data.sold_to?.address,
          data.buyer?.address,
          formatAddress(data.shipping_address),
          formatAddress(data.shipping_address?.address),
          formatAddress(data.billing_address?.address),
          formatAddress(data.buyer?.address),
          formatAddress(data.issued_to?.address),
          formatAddress(data.sold_to?.address),
          formatAddress(data.order_details?.shipping_address),
          'N/A'
        );
        if (fullAddress && fullAddress !== 'N/A') return fullAddress;
        const addressSources = [
          data.billing_address,
          data.shipping_address,
          data.issued_to,
          data.sold_to,
          data.buyer,
          data.order_details?.shipping_address,
          data.issued_to
        ].filter(Boolean);
        for (const source of addressSources) {
          const fragments = [
            source.street || source.address_line1 || source.address1,
            source.address_line2,
            source.city,
            source.state,
            source.zip || source.postal_code || source.postcode
          ].filter(Boolean);
          if (fragments.length > 0) return fragments.join(', ');
        }
        return 'N/A';
      })(),
  email: getFirstValid(
    data.issued_to?.email,
    data.shipping_address?.email,
    data.order_details?.shipping_address?.email,
    data.billing_address?.email
  ),
},
    summary: {
      total: getFirstValid(
        data.summary?.total,
        data.total?.total_amount,
        data.order_summary?.total,
        data.payment_summary?.total,
        0
      ),
      subtotal: getFirstValid(
        data.summary?.subtotal,
        data.order_summary?.subtotal,
        data.payment_summary?.subtotal,
        0
      ),
      tax: getFirstValid(
        data.summary?.tax,
        data.total?.tax_amount,
        data.total?.tax,
        data.order_summary?.est_tax,
        data.payment_summary?.estimated_tax,
        0
      ),
      shipping: getFirstValid(
        data.summary?.shipping,
        data.order_summary?.value_shipping,
        data.payment_summary?.value_shipping,
        0
      ),
    },
  };
};




  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvoiceData | null>(null);
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";


const processFile = async (file: File) => {
  setLoading(true);
  setError(null);

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    setError('Invalid file type. Please upload a PDF or image file.');
    setLoading(false);
    return;
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    setError('File too large. Maximum size is 5MB.');
    setLoading(false);
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_URL}/api/extract`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    // Clean and parse the result
    let parsedJson;
    try {
      if (typeof data.result === 'string') {
        // Remove markdown formatting and clean the string
        const cleanJson = data.result
          .replace(/^```json\s*/, '')  // Remove opening ```json
          .replace(/\s*```$/, '')      // Remove closing ```
          .trim();
        parsedJson = JSON.parse(cleanJson);
      } else {
        parsedJson = data.result;
      }

      // Normalize the data structure
      const normalizedData = normalizeInvoiceData(parsedJson);
      setResult(normalizedData);
      setFile(file);
    } catch (parseError) {
      console.error('Parsing error:', parseError);
      throw new Error('Failed to parse server response');
    }
  } catch (err) {
    console.error('Processing error:', err);
    setError(err instanceof Error ? err.message : "Failed to process invoice");
  } finally {
    setLoading(false);
  }
};


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
  setError(null);

  const droppedFile = e.dataTransfer.files[0];
  if (!droppedFile) {
    setError('No file provided');
    return;
  }

  await processFile(droppedFile);
};

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  setError(null);
  const selectedFile = e.target.files?.[0];
  if (!selectedFile) {
    setError('No file selected');
    return;
  }

  await processFile(selectedFile);
};

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Extract Invoice Data in Seconds
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground text-balance">
            Upload any invoice format and let AI extract all the data you need.
            Works with images, PDFs, and more.
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 p-12 text-center cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload invoice files"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-1">
                Drop your invoices here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse. Supports PDF, PNG, JPG, and more.
              </p>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
       {loading && (
  <div className="mt-4 flex items-center justify-center gap-2 text-primary">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>Processing invoice...</span>
  </div>
)}

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        {/* Results Display */}
        {result && (
  <div className="mt-4 p-6 bg-card border rounded-md space-y-4">
    <h3 className="text-lg font-semibold text-primary">Invoice Summary</h3>
    <div className="grid grid-cols-2 gap-4 ">
      <div>
        <p className="text-sm text-muted-foreground">Invoice Number</p>
        <p className="font-medium">{result.invoice_details?.invoice_no || 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Date</p>
        <p className="font-medium">{result.invoice_details?.date || 'N/A'}</p>
      </div>

      <div className="col-span-2">
        <p className="text-sm text-muted-foreground">Seller Details</p>
        <p className="font-medium">{result.seller_details?.name || 'N/A'}</p>
        <p className="text-sm text-muted-foreground mt-1">{result.seller_details?.address || 'Online Seller'}</p>
      </div>
      <div className="col-span-2">
        <p className="text-sm text-muted-foreground">Issued To</p>
        <p className="font-medium">{result.issued_to?.name || 'N/A'}</p>
        <p className="text-sm text-muted-foreground mt-1">{result.issued_to?.address || 'N/A'}</p>
      </div>
      <div className="col-span-2">
        <div className="border-t pt-4 mt-2">
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold">Total Amount</p>
            <p className="text-lg font-bold text-primary">
              ${result.summary?.total?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Supported Formats */}
        <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4 text-primary" />
            <span>PDF</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span>PNG</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span>JPG</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4 text-primary" />
            <span>TIFF</span>
          </div>
        </div>
      </div>
    </section>
  );
}
