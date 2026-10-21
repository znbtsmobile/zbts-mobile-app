import React from "react";
import { ArrowLeft, Download, FileText } from "lucide-react";

interface FormDownloadsScreenProps {
  onBack: () => void;
}

export const FormDownloadsScreen: React.FC<FormDownloadsScreenProps> = ({ onBack }) => {
  const forms = [
    {
      name: "Blood request form",
      url: "https://www.dropbox.com/scl/fi/s1e0k3s8fou4obiak2rer/website_report.pdf?rlkey=ae9zpszmsaamomo4f588veqfd&st=j2eyj9j4&dl=1",
    },
    {
      name: "Blood transportation form",
      url: "/forms/blood-transportation-form.pdf",
    },
    {
      name: "Blood utilization form",
      url: "/forms/blood-utilization-form.pdf",
    },
    {
      name: "Doner Questionnaire form",
      url: "/forms/doner-questionnaire-form.pdf",
    },
    {
      name: "Emergence Request form",
      url: "/forms/emergence-request-form.pdf",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer text-[#0D47A1]"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-black">Form Downloads</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map((form, index) => (
          <a
            key={index}
            href={form.url}
            download
            className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all active:scale-[0.98] cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1976D2] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-800 text-base">{form.name}</span>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1976D2] text-white shadow-sm group-hover:bg-[#1565C0] shrink-0">
              <Download className="w-5 h-5" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
