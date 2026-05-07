import { useEffect, useState } from 'react';
import { Database, Layers, GitMerge } from 'lucide-react';

interface DocsData {
  decomposition: {
    presentation: string;
    application: string;
    data: string;
  };
  dataDictionary: Array<{ table: string; columns: string }>;
  flow: string[];
}

const ARCHITECTURE_DATA: DocsData = {
  decomposition: {
    presentation: "React.js Dashboards. Role-specific views (Admin, Doctor, Receptionist) with React Router & TailwindCSS.",
    application: "Firebase Serverless Architecture. Logic handled by Firebase Authentication & Client-side Firestore SDK.",
    data: "Google Firestore (NoSQL). Real-time document database with granular Security Rules and Collections."
  },
  dataDictionary: [
    { table: 'users (Collection)', columns: 'uid (PK), name, role (admin/doctor/receptionist), email, status' },
    { table: 'patients (Collection)', columns: 'id (PK), firstName, lastName, dob, gender, contact, address, bloodGroup, allergies, status, emergencyContact' },
    { table: 'appointments (Collection)', columns: 'id (PK), patientId (FK), doctorId (FK), date, status (scheduled/completed), notes' },
    { table: 'medical_records (Collection)', columns: 'id (PK), patientId (FK), doctorId (FK), clinicalHistory (JSON map), diagnosis, prescription, createdAt' },
    { table: 'billing (Collection)', columns: 'id (PK), patientId (FK), amount, status (paid/unpaid), issuedDate, currency (ETB)' }
  ],
  flow: [
    "1. Receptionist: Logs in via Firebase Auth > Registers Patient in Firestore > Books Appointment session.",
    "2. Doctor: Authenticates > Real-time view of Appointments > Conducts consult > Finalizes EMR in Medical Records collection.",
    "3. Billing: Automated trigger on EMR creation > Receptionist monitors specific patient ledger for real-time payment status."
  ]
};

export default function Docs() {
  const [data] = useState<DocsData | null>(ARCHITECTURE_DATA);

  if (!data) return <div className="p-8 text-center text-slate-500 animate-pulse font-medium">Loading Architecture Specs...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12 animate-in fade-in duration-700">
      <div className="border-b border-slate-200/60 pb-6 mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">System Architecture</h1>
        <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
          Automated Healthcare Information System (AHIS)
          <span className="font-bold text-[10px] bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-primary-100">V1.0.0</span>
        </p>
      </div>

      <section>
        <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-slate-800">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          System Decomposition (3-Tier)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 border-t-4 border-t-blue-500 hover:shadow-lg transition-all group">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center justify-between">
              Presentation Layer
              <span className="text-xs font-mono text-blue-500 bg-blue-50 px-2 py-1 rounded">React</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.decomposition.presentation}</p>
          </div>
          <div className="glass-panel p-6 border-t-4 border-t-emerald-500 hover:shadow-lg transition-all group">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center justify-between">
              Application Layer
              <span className="text-xs font-mono text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Express</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.decomposition.application}</p>
          </div>
          <div className="glass-panel p-6 border-t-4 border-t-purple-500 hover:shadow-lg transition-all group">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center justify-between">
              Data Layer
              <span className="text-xs font-mono text-purple-500 bg-purple-50 px-2 py-1 rounded">PostgreSQL</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.decomposition.data}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-slate-800">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          Data Dictionary (3NF Schema)
        </h2>
        <div className="glass-panel overflow-hidden border border-slate-200/60 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80 backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest w-1/4">
                  Entity / Table
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Columns & Constraints
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-slate-100">
              {data.dataDictionary.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 bg-white/40">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      {item.table}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-mono leading-relaxed bg-white/20">
                    {item.columns.split(', ').map((col, i) => (
                      <span key={i} className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 mr-2 mb-2 font-medium">
                        {col}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-slate-800">
           <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <GitMerge className="w-5 h-5" />
          </div>
          Global Control Flow (Patient Journey)
        </h2>
        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative border-l-2 border-emerald-100 ml-4 md:ml-8 space-y-10">
            {data.flow.map((step, index) => {
              const words = step.split(':');
              const title = words[0];
              const desc = words.slice(1).join(':');

              return (
                <div key={index} className="relative pl-8 sm:pl-10 group">
                  <div className="absolute w-8 h-8 bg-white rounded-full -left-[17px] flex items-center justify-center border-4 border-emerald-50 shadow-sm group-hover:border-emerald-100 group-hover:scale-110 transition-all">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                       <span className="text-emerald-600 font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">STEP 0{index + 1}</span>
                       {title}
                    </h4>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
