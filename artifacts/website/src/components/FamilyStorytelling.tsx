import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MessageSquareWarning, ArrowRight, ShieldCheck, BellRing } from "lucide-react";

export function FamilyStorytelling() {
  const { t } = useTranslation("family");
  return (
    <div className="relative max-w-4xl mx-auto w-full">
      <div className="grid md:grid-cols-3 gap-6 relative z-10">
        
        {/* Step 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col relative z-20"
        >
          <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
            <MessageSquareWarning className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">{t("story.step1Title")}</h4>
          <p className="text-sm text-gray-600">{t("story.step1Desc")}</p>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 border border-gray-100 font-mono">
            {t("story.step1Sms")}
          </div>
        </motion.div>

        {/* Step 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-primary text-white p-6 rounded-2xl shadow-xl shadow-primary/20 flex flex-col relative z-20"
        >
          <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center text-white mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h4 className="font-bold mb-2">{t("story.step2Title")}</h4>
          <p className="text-sm text-blue-100">{t("story.step2Desc")}</p>
        </motion.div>

        {/* Step 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col relative z-20"
        >
          <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
            <BellRing className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">{t("story.step3Title")}</h4>
          <p className="text-sm text-gray-600">{t("story.step3Desc")}</p>
          
          <div className="mt-auto pt-4 flex items-center gap-2 text-green-600 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4" /> {t("story.familyProtected")}
          </div>
        </motion.div>

      </div>
      
      {/* Connecting lines for desktop */}
      <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
    </div>
  );
}
