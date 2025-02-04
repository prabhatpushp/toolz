"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search, Code2, Blocks, Wrench } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
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
      router.push("/");
    }, 15000);

    return () => {
      clearInterval(timer);
      clearTimeout(navigationTimer);
    };
  }, [router]);

  return (
    <div className="bg-gradient-to-b h-full from-background to-background/95 flex items-center justify-center p-4">
      {/* Floating Icons Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1 left-[10%] animate-float-slow">
          <Code2 className="w-12 h-12 text-primary/10" />
        </div>
        <div className="absolute top-[20%] right-[15%] animate-float-medium">
          <Search className="w-10 h-10 text-primary/10" />
        </div>
        <div className="absolute bottom-[30%] left-[20%] animate-float-fast">
          <Blocks className="w-8 h-8 text-primary/10" />
        </div>
        <div className="absolute bottom-[20%] right-[25%] animate-float-slow">
          <Wrench className="w-14 h-14 text-primary/10" />
        </div>
      </div>

      <Card className="max-w-md w-full border-2 border-border/50 shadow-lg relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

        <CardContent className="pt-12 pb-8 text-center relative space-y-8">
          {/* 404 Text with Glow */}
          <div className="relative">
            <h1 className="text-[8rem] font-bold leading-none tracking-tighter bg-gradient-to-b from-primary/90 to-primary/50 text-transparent bg-clip-text">
              404
            </h1>
            <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10" />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground/90">
              Page Not Found
            </h2>
            <p className="text-muted-foreground/80 max-w-sm mx-auto">
              Oops! This page seems to be missing 🔍. Our system has logged this
              issue, and our development team has been notified. In the
              meantime, feel free to explore our other tools! ✨
            </p>
          </div>

          {/* Divider with Dots */}
          <div className="flex items-center justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/40"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>

          <p className="text-sm text-muted-foreground/70 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
            Redirecting in{" "}
            <span className="text-primary font-medium inline-block min-w-[1.5rem]">
              {countdown}s
            </span>
          </p>
        </CardContent>

        <CardFooter className="flex justify-center gap-3 pb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2 border-border/50 hover:bg-background/80 relative group px-6"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="gap-2 bg-primary/90 hover:bg-primary/80 relative group px-6"
          >
            <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
