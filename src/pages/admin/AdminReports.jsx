import React, { useState } from 'react';
import { FileText, Download, Printer, Table, CheckCircle2, Calendar, ShieldCheck } from 'lucide-react';
import { db } from '../../db/transitDb.js';

export default function AdminReports({ selectedCity = 'delhi' }) {
  const [reportType, setReportType] = useState('DUTIES');
  const [downloadNotice, setDownloadNotice] = useState('');

  const duties = db.getCollection(selectedCity, 'duties');
  const drivers = db.getCollection(selectedCity, 'drivers');
  const buses = db.getCollection(selectedCity, 'buses');
  const routes = db.getCollection(selectedCity, 'routes');

  const triggerCSVDownload = (filename, csvContent) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadNotice(`✓ Successfully generated & downloaded ${filename}`);
    setTimeout(() => setDownloadNotice(''), 4000);
  };

  const handleExportDailyManifest = () => {
    const headers = ['Duty_Code', 'Shift', 'Route_Code', 'Bus_Number', 'Driver_Name', 'Driver_ID', 'Start_Time', 'End_Time', 'Status'];
    const rows = duties.map(d => [
      d.dutyCode,
      d.shift,
      d.routeCode,
      d.busNumber,
      `"${d.crewName}"`,
      d.crewId,
      d.startTime,
      d.endTime,
      d.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerCSVDownload(`CityFlow_Daily_Manifest_${selectedCity.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const handleExportDriverCompliance = () => {
    const headers = ['Driver_ID', 'Driver_Name', 'License_Number', 'Badge', 'Accumulated_Hours', 'Last_Shift_End', 'Rest_Compliant_11h', 'Compliance_Score'];
    const rows = drivers.map(d => {
      const restH = d.lastShiftEnd ? ((Date.now() - new Date(d.lastShiftEnd).getTime()) / (1000 * 3600)) : 24;
      return [
        d.id,
        `"${d.name}"`,
        d.licenseNumber,
        d.badgeNumber,
        d.accumulatedHours || 6,
        d.lastShiftEnd || 'N/A',
        restH >= 11 ? 'YES' : 'NO_DEFICIT',
        `${d.complianceScore || 95}%`
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerCSVDownload(`CityFlow_Driver_Compliance_Audit_${selectedCity.toUpperCase()}.csv`, csv);
  };

  const handleExportFleetStatus = () => {
    const headers = ['Bus_ID', 'Bus_Number', 'Model', 'Fuel_Type', 'Battery_Percent', 'Status', 'Depot', 'Odometer_KM', 'Next_Service_Due'];
    const rows = buses.map(b => [
      b.id,
      b.busNumber,
      `"${b.model}"`,
      b.type,
      b.batteryPct || 100,
      b.status,
      `"${b.depot}"`,
      b.odometerKm,
      b.nextServiceDue
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerCSVDownload(`CityFlow_Fleet_Asset_Roster_${selectedCity.toUpperCase()}.csv`, csv);
  };

  const handlePrintManifest = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Document & Manifest Export Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Dispatch Reports & Compliance Audits
          </h1>
          <p className="text-xs text-muted-foreground">
            Generate formal CSV manifests, printable operational schedules, and regulatory rest compliance records.
          </p>
        </div>

        <button
          onClick={handlePrintManifest}
          className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-mono text-xs font-bold shadow-xs flex items-center space-x-2 transition-all active:scale-95"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Manifest View</span>
        </button>
      </div>

      {downloadNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        
        {/* Card 1: Daily Schedule Manifest */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-foreground font-bold text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Daily Master Duty Manifest</span>
          </div>
          <p className="text-muted-foreground font-sans text-xs">
            Complete daily corridor roster containing all {duties.length} shift duties, driver pairings, bus assignments, and temporal timestamps.
          </p>
          <button
            onClick={handleExportDailyManifest}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Manifest</span>
          </button>
        </div>

        {/* Card 2: Driver Compliance Audit */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-foreground font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Rest & Safety Compliance Audit</span>
          </div>
          <p className="text-muted-foreground font-sans text-xs">
            Official regulatory audit covering all {drivers.length} drivers, accumulated duty hours, verified rest intervals, and compliance indices.
          </p>
          <button
            onClick={handleExportDriverCompliance}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Compliance CSV</span>
          </button>
        </div>

        {/* Card 3: Fleet Maintenance Log */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-foreground font-bold text-sm">
            <Table className="w-4 h-4 text-blue-500" />
            <span>Fleet Asset & Inspection Report</span>
          </div>
          <p className="text-muted-foreground font-sans text-xs">
            Vehicle health log for all {buses.length} buses including battery SoC levels, odometer readings, and scheduled depot service dates.
          </p>
          <button
            onClick={handleExportFleetStatus}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Fleet Asset CSV</span>
          </button>
        </div>

      </div>

      {/* Live Preview Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 bg-muted/30 border-b border-border flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-foreground uppercase tracking-wider">
            Live Schedule Preview ({duties.slice(0, 15).length} of {duties.length} Records)
          </span>
          <span className="text-muted-foreground">Showing current operational shift</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase">
              <tr>
                <th className="p-3">Duty Code</th>
                <th className="p-3">Shift</th>
                <th className="p-3">Route</th>
                <th className="p-3">Assigned Vehicle</th>
                <th className="p-3">Assigned Driver</th>
                <th className="p-3">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {duties.slice(0, 15).map(d => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-bold text-foreground">{d.dutyCode}</td>
                  <td className="p-3">{d.shift}</td>
                  <td className="p-3 font-bold text-foreground">Route {d.routeCode}</td>
                  <td className="p-3">{d.busNumber}</td>
                  <td className="p-3 font-sans font-semibold text-foreground">{d.crewName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

