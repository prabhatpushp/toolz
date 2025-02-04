"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, AlertTriangle, Bug, Shield, XCircle, Info } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(30);
  const routerRef = useRef(router);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error);
    }
  }, [error]);

  useEffect(() => {
    // Log error details to console
    window.console.error("Error details:", error);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const navigationTimer = setTimeout(() => {
      routerRef.current.push("/");
    }, 30000);

    return () => {
      clearInterval(timer);
      clearTimeout(navigationTimer);
    };
  }, []);

  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.history.back();
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/");
  };

  return (
    <div className="bg-gradient-to-b from-destructive/5 to-destructive/10 min-h-[calc(100vh-3rem)] flex items-center justify-center p-4">
      {/* Floating Icons Background */}
      <div>
        <div className="absolute top-1 left-[10%] animate-float-slow">
          <Bug className="w-12 h-12 text-destructive/20" />
        </div>
        <div className="absolute top-[20%] right-[15%] animate-float-medium">
          <AlertTriangle className="w-10 h-10 text-destructive/20" />
        </div>
        <div className="absolute bottom-[30%] left-[20%] animate-float-fast">
          <Shield className="w-8 h-8 text-destructive/20" />
        </div>
        <div className="absolute bottom-[20%] right-[25%] animate-float-slow">
          <XCircle className="w-14 h-14 text-destructive/20" />
        </div>
      </div>

      <Card className="w-full max-w-md border-destructive/20 z-20">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-destructive/10 blur-xl rounded-full"></div>
            <AlertTriangle className="w-16 h-16 text-destructive relative" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-semibold text-foreground">Something Went Wrong</h1>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center justify-center rounded-full w-6 h-6 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-popover text-popover-foreground border shadow-md px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4 text-muted-foreground" />
                      <span>View error details in console</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-muted-foreground text-base">
              We apologize for the inconvenience. Our team has been notified and we will fix the issue soon.
            </p>
          </div>

          {error.digest && (
            <div className="bg-muted/50 rounded-lg py-2 px-3">
              <p className="text-sm text-muted-foreground font-mono">Error ID: {error.digest}</p>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg py-2 px-3">
            <p className="text-sm text-muted-foreground">
              Redirecting to homepage in <span className="font-medium text-foreground">{countdown}</span> seconds...
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleHomeClick}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
