import { useState, useEffect } from "react";

export const usePwaInstall = () => {
 const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
 const [canInstall, setCanInstall] = useState(false);

 useEffect(() => {
 const handleBeforeInstallPrompt = (e: Event) => {
 e.preventDefault();
 setDeferredPrompt(e);
 setCanInstall(true);
 };

 window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

 return () => {
 window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
 };
 }, []);

 const installPwa = async () => {
 if (!deferredPrompt) {
 alert("To install, tap the Share or Browser Menu button and select 'Add to Home Screen'.");
 return;
 }
 deferredPrompt.prompt();
 const { outcome } = await deferredPrompt.userChoice;
 if (outcome === "accepted") {
 setCanInstall(false);
 setDeferredPrompt(null);
 }
 };

 return {
 canInstall,
 installPwa
 };
};
