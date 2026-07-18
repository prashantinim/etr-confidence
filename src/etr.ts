export type EtrInputs = {
  referenceMinutes: number
  baseTravelMinutes: number
  baseRepairMinutes: number
  switchingMinutes: number
  operationalZone: string
  operationalZoneMultiplier: number
  trafficLevel: TrafficLevel
  dayPeriod: DayPeriod
  weatherTravelMultiplier: number
  repairCauseMultiplier: number
  assetDamageMultiplier: number
  weatherRepairMultiplier: number
  accessMultiplier: number
  crewAvailabilityMultiplier: number
  incidentEscalationMultiplier: number
  dispatchDelayMinutes: number
  backfeedCreditMinutes: number
  faultLocationConfidence: number
  uncertainty: number
  materialDelayMinutes: number
}

export type TrafficLevel = 'normal' | 'moderate' | 'high'
export type DayPeriod = 'day' | 'night'

/** Versioned ordinal coefficients. In production this configuration is
 * recalibrated from completed outages, then approved before activation. */
export const TRAFFIC_MULTIPLIERS: Record<TrafficLevel, number> = {
  normal: 1.0,
  moderate: 1.3,
  high: 1.6,
}

export const DAY_NIGHT_MULTIPLIERS: Record<DayPeriod, number> = {
  day: 1.0,
  night: 2.0,
}

export function formatClock(minutes: number) {
  const normal = ((Math.round(minutes) % 1440) + 1440) % 1440
  const hour = Math.floor(normal / 60)
  const minute = normal % 60
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'pm' : 'am'}`
}

export function formatDuration(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

/** Transparent equation that mirrors the existing ADMS rule structure.
 * Utility-owned coefficients are calibrated against actual restoration results.
 */
export function calculateEtr(input: EtrInputs) {
  const travelMinutes = Math.round(input.baseTravelMinutes * input.operationalZoneMultiplier * TRAFFIC_MULTIPLIERS[input.trafficLevel] * DAY_NIGHT_MULTIPLIERS[input.dayPeriod] * input.weatherTravelMultiplier)
  const repairMinutes = Math.round(input.baseRepairMinutes * input.repairCauseMultiplier * input.assetDamageMultiplier * input.weatherRepairMultiplier * input.accessMultiplier * input.crewAvailabilityMultiplier * input.incidentEscalationMultiplier)
  const p50Minutes = Math.max(0, input.dispatchDelayMinutes + travelMinutes + repairMinutes + input.switchingMinutes - input.backfeedCreditMinutes)
  const confidencePenalty = 1 + (1 - input.faultLocationConfidence) * .35
  const spread = Math.round(p50Minutes * input.uncertainty * confidencePenalty)
  const p20Minutes = Math.max(0, p50Minutes - Math.round(spread * .65))
  const p80Minutes = p50Minutes + spread + input.materialDelayMinutes
  return { travelMinutes, repairMinutes, p50Minutes, p20Minutes, p80Minutes, range: `${formatClock(input.referenceMinutes + p20Minutes)}–${formatClock(input.referenceMinutes + p80Minutes)}` }
}
