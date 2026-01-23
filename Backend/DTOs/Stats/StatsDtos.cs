namespace GestionVisitaAPI.DTOs.Stats;

public class DashboardStatsDto
{
    public int TodayVisits { get; set; }
    public int WeekVisits { get; set; }
    public int ActiveVisits { get; set; }
    public int DailyAverage { get; set; }
}

public class KpiResponseDto
{
    public int Today { get; set; }
    public int ThisWeek { get; set; }
    public int DailyAverage { get; set; }
    public int AvgDuration { get; set; }
}

public class DailyTrendResponseDto
{
    public List<string> Dates { get; set; } = new();
    public List<int> Visits { get; set; } = new();
}

public class DepartmentStatsResponseDto
{
    public string Department { get; set; } = string.Empty;
    public int Visits { get; set; }
    public double Percentage { get; set; }
}

public class DurationStatsResponseDto
{
    public int Average { get; set; }
    public int Min { get; set; }
    public int Max { get; set; }
}

public class HourlyPeakDto
{
    public string Hour { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Visits { get; set; }
}

public class WeekdayAverageDto
{
    public string Day { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Average { get; set; }
}

public class WeeklyCompareDto
{
    public string Day { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Current { get; set; }
    public int Previous { get; set; }
    public double Change { get; set; }
}
