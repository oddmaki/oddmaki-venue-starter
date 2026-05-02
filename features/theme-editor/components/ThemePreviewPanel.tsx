"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";

export function ThemePreviewPanel() {
  return (
    <div className="flex flex-col gap-6">
      {/* Buttons */}
      <div>
        <p className="text-xs text-default-400 uppercase tracking-wider mb-3">
          Buttons
        </p>
        <div className="flex flex-wrap gap-2">
          <Button color="primary" size="sm">
            Primary
          </Button>
          <Button color="secondary" size="sm">
            Secondary
          </Button>
          <Button color="primary" size="sm" variant="flat">
            Primary Flat
          </Button>
          <Button color="secondary" size="sm" variant="flat">
            Secondary Flat
          </Button>
          <Button color="primary" size="sm" variant="bordered">
            Bordered
          </Button>
          <Button color="danger" size="sm" variant="flat">
            Danger
          </Button>
        </div>
      </div>

      {/* Chips */}
      <div>
        <p className="text-xs text-default-400 uppercase tracking-wider mb-3">
          Chips
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip color="primary" size="sm" variant="flat">
            Active
          </Chip>
          <Chip color="secondary" size="sm" variant="flat">
            NO
          </Chip>
          <Chip color="warning" size="sm" variant="flat">
            Draft
          </Chip>
          <Chip color="danger" size="sm" variant="flat">
            Error
          </Chip>
          <Chip color="default" size="sm" variant="flat">
            Default
          </Chip>
        </div>
      </div>

      {/* Cards */}
      <div>
        <p className="text-xs text-default-400 uppercase tracking-wider mb-3">
          Cards & Surfaces
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardBody className="p-3">
              <p className="text-sm font-semibold">Content 1</p>
              <p className="text-xs text-default-400">Default card surface</p>
            </CardBody>
          </Card>
          <div className="rounded-lg bg-content2 p-3">
            <p className="text-sm font-semibold">Content 2</p>
            <p className="text-xs text-default-400">Nested surface</p>
          </div>
        </div>
      </div>

      {/* Market-like preview */}
      <div>
        <p className="text-xs text-default-400 uppercase tracking-wider mb-3">
          Market Preview
        </p>
        <Card>
          <CardBody className="gap-3">
            <p className="text-sm font-semibold">
              Will BTC reach $200K by 2026?
            </p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg bg-primary/10 py-2 text-center text-sm font-semibold text-primary">
                Yes 67¢
              </div>
              <div className="flex-1 rounded-lg bg-secondary/10 py-2 text-center text-sm font-semibold text-secondary">
                No 33¢
              </div>
            </div>
            <div className="flex justify-between text-xs text-default-400">
              <span>24 orders</span>
              <span>$12,450 Vol.</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Input */}
      <div>
        <p className="text-xs text-default-400 uppercase tracking-wider mb-3">
          Inputs
        </p>
        <Input
          endContent={<span className="text-default-400 text-xs">USDC</span>}
          label="Amount"
          placeholder="0.00"
          size="sm"
        />
      </div>
    </div>
  );
}
