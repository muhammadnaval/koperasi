<?php

namespace Tests\Unit\Services;

use App\Services\Reports\KPIMonitoringService;
use Tests\TestCase;

class KPIMonitoringServiceTest extends TestCase
{
    public function test_kpi_monitoring_service_returns_valid_metrics_structure(): void
    {
        $service = new KPIMonitoringService;
        $kpis = $service->getKPIMetrics();

        $this->assertArrayHasKey('digital_adoption_rate_percent', $kpis);
        $this->assertArrayHasKey('median_input_time_minutes', $kpis);
        $this->assertArrayHasKey('loan_approval_sla_hours', $kpis);
        $this->assertArrayHasKey('reconciliation_variance_amount', $kpis);
        $this->assertArrayHasKey('data_isolation_incidents', $kpis);
        $this->assertArrayHasKey('e2e_pass_rate_percent', $kpis);

        $this->assertGreaterThanOrEqual(95.0, $kpis['digital_adoption_rate_percent']);
        $this->assertLessThanOrEqual(2.0, $kpis['median_input_time_minutes']);
        $this->assertEquals(0, $kpis['data_isolation_incidents']);
        $this->assertEquals(100.0, $kpis['e2e_pass_rate_percent']);
    }
}
