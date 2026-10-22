import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonthlyReportData } from './api_request/reports';

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export const generateExecutiveReportPdf = (data: MonthlyReportData): void => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // ── Header Banner ─────────────────────────────────────────────────────────
    doc.setFillColor(5, 150, 105); // emerald-600
    doc.rect(0, 0, pageWidth, 75, 'F');

    // Brand Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('CostOp', 40, 42);

    // Document Title
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(220, 252, 231); // emerald-100
    doc.text('EXECUTIVE MONTHLY SPEND & RENEWALS REPORT', 40, 60);

    // Organization & Date metadata (right aligned)
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(data.organization_name || 'Organization Workspace', pageWidth - 40, 38, { align: 'right' });
    doc.setFontSize(9);
    doc.setTextColor(209, 250, 229);
    doc.text(`Period: ${data.report_period}`, pageWidth - 40, 52, { align: 'right' });
    doc.text(`Generated: ${new Date(data.generated_at).toLocaleDateString()}`, pageWidth - 40, 64, { align: 'right' });

    // ── KPI Summary Cards ─────────────────────────────────────────────────────
    let currentY = 95;

    const cards = [
        { label: 'Total Monthly Spend', value: currencyFormatter.format(data.total_monthly_spend) },
        { label: 'Projected Annual Spend', value: currencyFormatter.format(data.annual_run_rate) },
        { label: 'Active Subscriptions', value: String(data.active_subscriptions) },
        { label: 'Active Team Members', value: String(data.total_active_members) },
    ];

    const cardGap = 12;
    const cardWidth = (pageWidth - 80 - cardGap * 3) / 4;
    const cardHeight = 52;

    cards.forEach((card, idx) => {
        const x = 40 + idx * (cardWidth + cardGap);
        // Card background
        doc.setFillColor(248, 250, 252); // slate-50
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.roundedRect(x, currentY, cardWidth, cardHeight, 6, 6, 'FD');

        // Label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(card.label, x + 8, currentY + 18);

        // Value
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(card.value, x + 8, currentY + 38);
    });

    currentY += cardHeight + 25;

    // ── Section 1: Department / Category Breakdown ────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Department & Category Spend Breakdown', 40, currentY);

    const categoryRows = data.category_breakdown.map((c) => [
        c.category,
        currencyFormatter.format(c.spend),
        `${c.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
        startY: currentY + 8,
        head: [['Category / Department', 'Monthly Spend ($)', '% of Total Spend']],
        body: categoryRows.length > 0 ? categoryRows : [['No data recorded', '$0.00', '0%']],
        theme: 'striped',
        margin: { left: 40, right: 40 },
        headStyles: {
            fillColor: [15, 23, 42],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [51, 65, 85],
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
    });

    currentY = (doc as any).lastAutoTable.finalY + 25;

    // ── Section 2: Active Subscriptions Inventory ─────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Active Software Subscriptions', 40, currentY);

    const subRows = data.subscriptions.map((s) => [
        s.name,
        s.category || 'General',
        s.billing_cycle,
        currencyFormatter.format(s.cost),
        currencyFormatter.format(s.monthly_cost),
        String(s.seat_count),
        new Date(s.next_billing_date).toLocaleDateString(),
        s.is_auto_pay ? 'Auto-Pay' : 'Manual',
    ]);

    autoTable(doc, {
        startY: currentY + 8,
        head: [['Tool Name', 'Category', 'Cycle', 'Cost', 'Monthly Eq.', 'Seats', 'Renewal Date', 'Mode']],
        body: subRows.length > 0 ? subRows : [['No subscriptions found', '-', '-', '-', '-', '-', '-', '-']],
        theme: 'striped',
        margin: { left: 40, right: 40 },
        headStyles: {
            fillColor: [5, 150, 105],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
        },
        bodyStyles: {
            fontSize: 8.5,
            textColor: [51, 65, 85],
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
    });

    currentY = (doc as any).lastAutoTable.finalY + 25;

    // ── Section 3: Upcoming Renewals Watchlist ─────────────────────────────────
    // If not enough space on page, add page
    if (currentY > 680) {
        doc.addPage();
        currentY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Upcoming Renewals Watchlist (Next 30 Days)', 40, currentY);

    const renewalRows = data.upcoming_renewals.map((r) => [
        r.name,
        new Date(r.next_billing_date).toLocaleDateString(),
        r.days_until === 0 ? 'Today' : `In ${r.days_until} day(s)`,
        currencyFormatter.format(r.cost),
        r.is_auto_pay ? 'Auto-Pay' : 'Manual',
    ]);

    autoTable(doc, {
        startY: currentY + 8,
        head: [['Subscription', 'Renewal Date', 'Timing', 'Amount Due', 'Payment Type']],
        body: renewalRows.length > 0 ? renewalRows : [['No renewals due in the next 30 days', '-', '-', '-', '-']],
        theme: 'striped',
        margin: { left: 40, right: 40 },
        headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
        },
        bodyStyles: {
            fontSize: 8.5,
            textColor: [51, 65, 85],
        },
    });

    // ── Footer ───────────────────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(
            `CostOp SaaS Management Platform • Page ${i} of ${totalPages}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 20,
            { align: 'center' }
        );
    }

    // Trigger download
    const now = new Date();
    const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`;
    doc.save(`CostOp_Executive_Report_${dateStr}.pdf`);
};
