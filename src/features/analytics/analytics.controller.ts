import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards';
import { DateRangeDto } from './dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('export/summary')
  async exportSummary(@Query() query: DateRangeDto, @Res() res: Response) {
    const summary = await this.analyticsService.getAnalyticsSummary(query.startDate, query.endDate);

    const csv = [
      'Metric,Value',
      `Period Start,${this.analyticsService.formatDate(query.startDate)}`,
      `Period End,${this.analyticsService.formatDate(query.endDate)}`,
      `Total Borrowings,${summary.totalBorrowings}`,
      `Active Borrowings,${summary.activeBorrowings}`,
      `Overdue Borrowings,${summary.overdueBorrowings}`,
      `Returned Borrowings,${summary.returnedBorrowings}`,
    ].join('\n');

    const filename = `analytics_summary_${this.analyticsService.formatDate(query.startDate)}_to_${this.analyticsService.formatDate(query.endDate)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('export/borrowings')
  async exportBorrowings(@Query() query: DateRangeDto, @Res() res: Response) {
    const data = await this.analyticsService.getBorrowingsForPeriod(query.startDate, query.endDate);
    const csv = this.analyticsService.generateCsv(data);

    const filename = `borrowings_${this.analyticsService.formatDate(query.startDate)}_to_${this.analyticsService.formatDate(query.endDate)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('export/overdue')
  async exportOverdue(@Query() query: DateRangeDto, @Res() res: Response) {
    const data = await this.analyticsService.getOverdueBorrowingsForPeriod(query.startDate, query.endDate);
    const csv = this.analyticsService.generateCsv(data);

    const filename = `overdue_borrowings_${this.analyticsService.formatDate(query.startDate)}_to_${this.analyticsService.formatDate(query.endDate)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
