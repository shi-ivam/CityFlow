import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle2, ShieldCheck, Download, Search } from 'lucide-react';

export default function VehicleDocumentsView({ busFleet = [] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const documentsList = busFleet.flatMap(bus => [
    {
      vehicleId: bus.id,
      busNumber: bus.busNumber,
      depot: bus.depot,
      docType: 'Registration Certificate (RC)',
      docNumber: `RC-${bus.busNumber.replace(/\s+/g, '-')}`,
      expiryDate: bus.compliance?.permitExpiry || '2028-06-30',
      status: 'VALID'
    },
    {
      vehicleId: bus.id,
      busNumber: bus.busNumber,
      depot: bus.depot,
      docType: 'Commercial Motor Insurance',
      docNumber: `INS-${bus.id.toUpperCase()}-881920`,
      expiryDate: bus.compliance?.insuranceExpiry || '2027-03-15',
      status: 'VALID'
    },
    {
      vehicleId: bus.id,
      busNumber: bus.busNumber,
      depot: bus.depot,
      docType: 'Fitness Certificate (MVD)',
      docNumber: `FIT-${bus.id.toUpperCase()}-0412`,
      expiryDate: bus.compliance?.fitnessExpiry || '2026-11-20',
      status: 'VALID'
    },
    {
      vehicleId: bus.id,
      busNumber: bus.busNumber,
      depot: bus.depot,
      docType: 'Pollution Under Control (PUC)',
      docNumber: `PUC-DEL-${bus.id.toUpperCase()}-99`,
      expiryDate: bus.compliance?.pollutionExpiry || '2026-10-05',
      status: (bus.id === 'bus-101' || bus.id === 'bus-302') ? 'EXPIRING_SOON' : 'VALID'
    }
  ]);

  const filteredDocs = documentsList.filter(d => 
    d.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.docType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.docNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Compliance Health Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">TOTAL REGISTERED DOCUMENTS</div>
          <div className="text-2xl font-bold text-foreground mt-1">{documentsList.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">RC, Insurance, Fitness, PUC</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">EXPIRING WITHIN 30 DAYS</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {documentsList.filter(d => d.status === 'EXPIRING_SOON').length}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Renewal notices issued</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">EXPIRED / SUSPENDED</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">0</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">100% Legal compliance</div>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-card p-3 rounded-lg border border-border flex items-center justify-between shadow-xs font-mono text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search document type, registration, certificate..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-muted/40 border border-input text-foreground outline-none font-sans"
          />
        </div>

        <div className="text-muted-foreground text-xs font-mono">
          Showing {filteredDocs.length} certificates
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden font-sans">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-mono uppercase text-[11px] font-semibold">
              <th className="p-3">Vehicle</th>
              <th className="p-3">Certificate Type</th>
              <th className="p-3 font-mono">Document Ref Number</th>
              <th className="p-3">Depot Authority</th>
              <th className="p-3">Expiration Date</th>
              <th className="p-3">Compliance Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-mono">
            {filteredDocs.map((doc, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition">
                <td className="p-3 font-bold text-foreground">
                  <div>{doc.busNumber}</div>
                  <div className="text-[10px] text-muted-foreground">{doc.vehicleId}</div>
                </td>
                <td className="p-3 font-sans font-bold text-foreground">{doc.docType}</td>
                <td className="p-3 font-mono text-primary font-medium">{doc.docNumber}</td>
                <td className="p-3 text-muted-foreground text-[11px]">{doc.depot}</td>
                <td className="p-3 font-bold text-foreground">{doc.expiryDate}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    doc.status === 'VALID'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                  }`}>
                    {doc.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer" title="Download Document Copy">
                    <Download className="w-3.5 h-3.5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
