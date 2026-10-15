// Predicciones ideales para explorar el reparto de potencia OFDM-DFRC.
export const ALPHA_MODEL = {
  carrierHz: 5.9e9,
  bandwidthHz: 20e6,
  totalPowerW: 1,
  nodeGainDbi: 15,
  deviceGainDbi: 3,
  noiseFigureDb: 6,
  temperatureK: 290,
  lightSpeed: 299_792_458,
  boltzmann: 1.380649e-23,
  users: {
    near: { label: "Cerca (100 m)", distanceM: 100 },
    far: { label: "Lejos (1,5 km)", distanceM: 1500 },
  },
  objects: {
    pedestrian: { label: "Peatón a 50 m", distanceM: 50, sigmaM2: 1 },
    car: { label: "Auto a 200 m", distanceM: 200, sigmaM2: 10 },
  },
} as const;

export type UserScenario = keyof typeof ALPHA_MODEL.users;
export type ObjectScenario = keyof typeof ALPHA_MODEL.objects;

const dbToLinear = (db: number) => 10 ** (db / 10);
const linearToDb = (value: number) => 10 * Math.log10(value);
const gainLinear = (gainDbi: number) => dbToLinear(gainDbi);
const log2 = (value: number) => Math.log(value) / Math.LN2;

export function alphaMetrics(alpha: number, user: UserScenario, object: ObjectScenario) {
  const model = ALPHA_MODEL;
  const boundedAlpha = Math.min(0.99, Math.max(0.01, alpha));
  const userParameters = model.users[user];
  const objectParameters = model.objects[object];
  const wavelength = model.lightSpeed / model.carrierHz;
  const nodeGain = gainLinear(model.nodeGainDbi);
  const deviceGain = gainLinear(model.deviceGainDbi);
  const noisePower = model.boltzmann * model.temperatureK * model.bandwidthHz * dbToLinear(model.noiseFigureDb);
  const communicationChannel = nodeGain * deviceGain * (wavelength / (4 * Math.PI * userParameters.distanceM)) ** 2;
  const communicationPowerW = boundedAlpha * model.totalPowerW;
  const sensingPowerW = (1 - boundedAlpha) * model.totalPowerW;
  const communicationSnrLinear = communicationChannel * communicationPowerW / noisePower;
  const dataRateMbps = model.bandwidthHz * log2(1 + communicationSnrLinear) / 1e6;
  const radarNumerator = sensingPowerW * nodeGain ** 2 * wavelength ** 2 * objectParameters.sigmaM2;
  const radarDenominator = (4 * Math.PI) ** 3 * objectParameters.distanceM ** 4 * noisePower;
  const radarSnrLinear = radarNumerator / radarDenominator;
  return {
    alpha: boundedAlpha,
    communicationPowerW,
    sensingPowerW,
    communicationSnrLinear,
    communicationSnrDb: linearToDb(communicationSnrLinear),
    dataRateMbps,
    radarSnrLinear,
    radarSnrDb: linearToDb(radarSnrLinear),
    objectDistanceM: objectParameters.distanceM,
    objectSigmaM2: objectParameters.sigmaM2,
    rangeResolutionM: model.lightSpeed / (2 * model.bandwidthHz),
    maximumDataRateMbps: model.bandwidthHz * log2(1 + alphaMetricsMaximumSnr(user)) / 1e6,
  };
}

function alphaMetricsMaximumSnr(user: UserScenario) {
  const model = ALPHA_MODEL;
  const wavelength = model.lightSpeed / model.carrierHz;
  const channel = gainLinear(model.nodeGainDbi) * gainLinear(model.deviceGainDbi)
    * (wavelength / (4 * Math.PI * model.users[user].distanceM)) ** 2;
  const noise = model.boltzmann * model.temperatureK * model.bandwidthHz * dbToLinear(model.noiseFigureDb);
  return channel * model.totalPowerW / noise;
}

export function tradeoffCurve(user: UserScenario, object: ObjectScenario) {
  return Array.from({ length: 99 }, (_, index) => {
    const alpha = (index + 1) / 100;
    const metrics = alphaMetrics(alpha, user, object);
    return { alpha, radarSnrDb: metrics.radarSnrDb, dataRateMbps: metrics.dataRateMbps };
  });
}

export function alphaModelFacts() {
  const model = ALPHA_MODEL;
  return {
    carrierGHz: model.carrierHz / 1e9,
    bandwidthMHz: model.bandwidthHz / 1e6,
    totalPowerW: model.totalPowerW,
    totalPowerDbm: 10 * Math.log10(model.totalPowerW * 1000),
    nodeGainDbi: model.nodeGainDbi,
    deviceGainDbi: model.deviceGainDbi,
    noiseFigureDb: model.noiseFigureDb,
    temperatureK: model.temperatureK,
    rangeResolutionM: model.lightSpeed / (2 * model.bandwidthHz),
  };
}
