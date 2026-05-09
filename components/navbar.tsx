"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import NextLink from "next/link";

import { ConnectButton } from "@/features/auth";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { WalletPanel } from "@/features/wallet/components";

export const Navbar = () => {
  return (
    <HeroUINavbar
      classNames={{ wrapper: "px-3 sm:px-6" }}
      maxWidth="xl"
      position="sticky"
    >
      {/* Left - Logo and App Name */}
      <NavbarContent justify="start">
        <NavbarBrand>
          <NextLink className="flex items-center gap-2" href="/">
            <Logo />
            <p className="font-bold text-inherit truncate">{siteConfig.name}</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* Right - Wallet, Connect */}
      <NavbarContent className="gap-1 sm:gap-2" justify="end">
        <NavbarItem>
          <WalletPanel />
        </NavbarItem>
        <NavbarItem>
          <ConnectButton />
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};
