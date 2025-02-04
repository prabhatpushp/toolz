"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbsStore } from "@/store/breadcrumbs-store";
import { Home } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Breadcrumbs() {
  const items = useBreadcrumbsStore((state) => state.items);

  if (!items.length) return null;

  return (
    <>
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
              </Link>
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          {items.map((item, index) => (
            <BreadcrumbItem
              key={item.label}
              className="hidden md:flex items-center"
            >
              {index < items.length - 1 ? (
                <>
                  <BreadcrumbLink asChild>
                    <Link href={item.href || "#"}>{item.label}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
