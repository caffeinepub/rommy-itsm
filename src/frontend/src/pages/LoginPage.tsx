import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Layers, Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyProfile, useRegisterUser } from "../hooks/useQueries";

const features = [
  { label: "Incident Management", desc: "Track and resolve IT incidents fast" },
  {
    label: "Service Requests",
    desc: "Handle user service requests efficiently",
  },
  { label: "Role-Based Access", desc: "Granular permissions for every team" },
  { label: "SLA Tracking", desc: "Stay on top of service level agreements" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, isLoginSuccess, identity, isInitializing } =
    useInternetIdentity();
  const { data: profile, isFetching: profileLoading } = useMyProfile();
  const registerUser = useRegisterUser();

  const [showSetup, setShowSetup] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  // After login: check profile
  useEffect(() => {
    if (isLoginSuccess && !profileLoading && identity) {
      if (profile === null) {
        setShowSetup(true);
      } else if (profile) {
        navigate({ to: "/dashboard" });
      }
    }
  }, [isLoginSuccess, profile, profileLoading, identity, navigate]);

  // If already authenticated on load, redirect
  useEffect(() => {
    if (!isInitializing && identity && profile) {
      navigate({ to: "/dashboard" });
    }
  }, [isInitializing, identity, profile, navigate]);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !department.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await registerUser.mutateAsync({
        name: name.trim(),
        department: department.trim(),
      });
      toast.success("Profile created! Welcome to Rommy ITSM.");
      setShowSetup(false);
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <>
      <div className="min-h-screen flex bg-background overflow-hidden">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.13_0.03_265)] via-[oklch(0.16_0.04_255)] to-[oklch(0.12_0.025_270)]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.92 0.01 250) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 250) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Glow orb */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-500/8 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col h-full p-12 justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Rommy ITSM
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="font-display text-4xl font-bold text-foreground leading-tight">
                Enterprise IT Service
                <br />
                <span className="text-primary">Management</span>
                <br />
                Reimagined
              </h2>
              <p className="text-muted-foreground text-base max-w-sm leading-relaxed">
                Streamline your IT operations with intelligent incident
                tracking, automated workflows, and real-time SLA monitoring.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3"
            >
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      {f.label}
                    </span>
                    <span className="text-muted-foreground text-sm ml-2">
                      — {f.desc}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative w-full max-w-md space-y-8"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Rommy ITSM
              </span>
            </div>

            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in with your Internet Identity to access the ITSM portal
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-glow">
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <Layers className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Secure & Decentralized
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Powered by Internet Computer Protocol
                  </p>
                </div>
              </div>

              <Button
                data-ocid="login.primary_button"
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign in with Internet Identity
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                First time? A profile setup will appear after authentication.
              </p>
            </div>

            <p className="text-xs text-center text-muted-foreground/60">
              © {new Date().getFullYear()}.{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-muted-foreground transition-colors"
              >
                Built with love using caffeine.ai
              </a>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Profile Setup Modal */}
      <Dialog open={showSetup} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-[440px] bg-card border-border"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Complete Your Profile
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Welcome to Rommy ITSM. Please set up your profile to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetupSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="setup-name">Full Name *</Label>
              <Input
                id="setup-name"
                data-ocid="profile_setup.name_input"
                placeholder="e.g. John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup-dept">Department *</Label>
              <Input
                id="setup-dept"
                data-ocid="profile_setup.department_input"
                placeholder="e.g. IT Operations, HR, Finance"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <Button
              type="submit"
              data-ocid="profile_setup.submit_button"
              disabled={registerUser.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {registerUser.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {registerUser.isPending ? "Setting up..." : "Complete Setup"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
