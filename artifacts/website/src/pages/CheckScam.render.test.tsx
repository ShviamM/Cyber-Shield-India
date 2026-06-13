import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  FraudVerdict,
  FraudVerdictRiskLevel,
} from "@workspace/api-client-react";

const { fraudCheckMock } = vi.hoisted(() => ({
  fraudCheckMock: vi.fn(),
}));

vi.mock("@workspace/api-client-react", async (importActual) => {
  const actual =
    await importActual<typeof import("@workspace/api-client-react")>();
  return {
    ...actual,
    fraudCheck: fraudCheckMock,
  };
});

vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/SEOHead", () => ({
  SEOHead: () => null,
}));

import "@/i18n";
import { ApiError } from "@workspace/api-client-react";
import CheckScam from "./CheckScam";
import checkEn from "@/i18n/locales/en/check";

function makeVerdict(overrides: Partial<FraudVerdict> = {}): FraudVerdict {
  return {
    type: "phone",
    value: "9876543210",
    riskLevel: "high",
    score: 90,
    reasons: ["Reported by multiple users"],
    signals: [],
    ...overrides,
  };
}

function makeApiError(status: number): ApiError {
  const response = new Response(null, { status, statusText: "Error" });
  return new ApiError(response, null, { method: "POST", url: "/fraud/check" });
}

beforeEach(() => {
  fraudCheckMock.mockReset();
  window.history.replaceState({}, "", "/check");
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("CheckScam verdict rendering", () => {
  const cases: Array<{
    level: FraudVerdictRiskLevel;
    title: string;
    text: string;
    ring: string;
    bar: string;
    iconClass: string;
  }> = [
    {
      level: "high",
      title: checkEn.verdict.high.title,
      text: "text-red-500",
      ring: "ring-red-500/30",
      bar: "bg-red-500",
      iconClass: "lucide-shield-alert",
    },
    {
      level: "medium",
      title: checkEn.verdict.medium.title,
      text: "text-amber-500",
      ring: "ring-amber-500/30",
      bar: "bg-amber-500",
      iconClass: "lucide-triangle-alert",
    },
    {
      level: "low",
      title: checkEn.verdict.low.title,
      text: "text-emerald-500",
      ring: "ring-emerald-500/30",
      bar: "bg-emerald-500",
      iconClass: "lucide-shield-check",
    },
    {
      level: "unknown",
      title: checkEn.verdict.unknown.title,
      text: "text-gray-300",
      ring: "ring-gray-500/30",
      bar: "bg-gray-400",
      iconClass: "lucide-circle-question-mark",
    },
  ];

  for (const { level, title, text, ring, bar, iconClass } of cases) {
    it(`renders the ${level} verdict with its title, score and reasons`, async () => {
      fraudCheckMock.mockResolvedValue(
        makeVerdict({
          riskLevel: level,
          score: 55,
          reasons: ["Signal one", "Signal two"],
        }),
      );

      const user = userEvent.setup();
      render(<CheckScam />);

      await user.type(screen.getByLabelText(checkEn.inputLabel), "9876543210");
      await user.click(
        screen.getByRole("button", { name: new RegExp(checkEn.analyzeCta) }),
      );

      const heading = await screen.findByRole("heading", {
        level: 2,
        name: title,
      });
      expect(heading).toBeInTheDocument();
      expect(screen.getByText("55/100")).toBeInTheDocument();
      expect(screen.getByText("Signal one")).toBeInTheDocument();
      expect(screen.getByText("Signal two")).toBeInTheDocument();
    });

    it(`applies the ${level} risk styling (heading, icon, score bar)`, async () => {
      fraudCheckMock.mockResolvedValue(
        makeVerdict({ riskLevel: level, score: 55 }),
      );

      const user = userEvent.setup();
      const { container } = render(<CheckScam />);

      await user.type(screen.getByLabelText(checkEn.inputLabel), "9876543210");
      await user.click(
        screen.getByRole("button", { name: new RegExp(checkEn.analyzeCta) }),
      );

      // Heading uses the risk-specific text color.
      const heading = await screen.findByRole("heading", {
        level: 2,
        name: title,
      });
      expect(heading).toHaveClass(text);

      // Icon container carries the risk-specific ring color and the right icon.
      const iconContainer = container.querySelector(".rounded-2xl");
      expect(iconContainer).not.toBeNull();
      expect(iconContainer).toHaveClass(ring);
      expect(iconContainer?.querySelector(`.${iconClass}`)).not.toBeNull();

      // Score bar fill uses the risk-specific background color and width.
      const scoreBar = container.querySelector(
        'div[style*="width"]',
      ) as HTMLElement | null;
      expect(scoreBar).not.toBeNull();
      expect(scoreBar).toHaveClass(bar);
      expect(scoreBar?.style.width).toBe("55%");
    });
  }

  it("shows the no-reasons copy when the verdict has no reasons", async () => {
    fraudCheckMock.mockResolvedValue(makeVerdict({ reasons: [] }));

    const user = userEvent.setup();
    render(<CheckScam />);

    await user.type(screen.getByLabelText(checkEn.inputLabel), "9876543210");
    await user.click(
      screen.getByRole("button", { name: new RegExp(checkEn.analyzeCta) }),
    );

    expect(await screen.findByText(checkEn.noReasons)).toBeInTheDocument();
  });
});

describe("CheckScam error rendering", () => {
  it("shows the rate-limited copy on a 429", async () => {
    fraudCheckMock.mockRejectedValue(makeApiError(429));

    const user = userEvent.setup();
    render(<CheckScam />);

    await user.type(screen.getByLabelText(checkEn.inputLabel), "9876543210");
    await user.click(
      screen.getByRole("button", { name: new RegExp(checkEn.analyzeCta) }),
    );

    expect(
      await screen.findByText(checkEn.error.rateLimited),
    ).toBeInTheDocument();
  });

  it("shows the limit-reached copy and a download CTA on a 402", async () => {
    fraudCheckMock.mockRejectedValue(makeApiError(402));

    const user = userEvent.setup();
    render(<CheckScam />);

    await user.type(screen.getByLabelText(checkEn.inputLabel), "9876543210");
    await user.click(
      screen.getByRole("button", { name: new RegExp(checkEn.analyzeCta) }),
    );

    expect(
      await screen.findByText(checkEn.error.limitReached),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(new RegExp(checkEn.download.cta)).length,
    ).toBeGreaterThan(0);
  });

  it("shows the generic copy on a non-rate-limit API error", async () => {
    fraudCheckMock.mockRejectedValue(makeApiError(500));

    const user = userEvent.setup();
    render(<CheckScam />);

    await user.type(screen.getByLabelText(checkEn.inputLabel), "9876543210");
    await user.click(
      screen.getByRole("button", { name: new RegExp(checkEn.analyzeCta) }),
    );

    expect(await screen.findByText(checkEn.error.generic)).toBeInTheDocument();
  });

  it("shows the generic copy on a non-API (network) error", async () => {
    fraudCheckMock.mockRejectedValue(new Error("network down"));

    const user = userEvent.setup();
    render(<CheckScam />);

    await user.type(screen.getByLabelText(checkEn.inputLabel), "9876543210");
    await user.click(
      screen.getByRole("button", { name: new RegExp(checkEn.analyzeCta) }),
    );

    expect(await screen.findByText(checkEn.error.generic)).toBeInTheDocument();
  });
});

describe("CheckScam deep-link", () => {
  it("auto-runs the check from /check?q=<value> and detects the type", async () => {
    fraudCheckMock.mockResolvedValue(makeVerdict({ riskLevel: "high" }));
    window.history.replaceState({}, "", "/check?q=9876543210");

    render(<CheckScam />);

    await waitFor(() => {
      expect(fraudCheckMock).toHaveBeenCalledTimes(1);
    });
    expect(fraudCheckMock).toHaveBeenCalledWith({
      type: "phone",
      value: "9876543210",
    });

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: checkEn.verdict.high.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("9876543210")).toBeInTheDocument();
  });

  it("does not auto-run a check when no q param is present", async () => {
    render(<CheckScam />);

    await Promise.resolve();
    expect(fraudCheckMock).not.toHaveBeenCalled();
  });
});
