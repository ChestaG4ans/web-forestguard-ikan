import { useEffect, useState } from 'react';
import {
  subscribeTelemetry,
  subscribeNodes,
  subscribeAlerts,
} from '../services/dataProvider';

/** Telemetri live satu node — { suhu, kelembapan, gas, waktu } atau null. */
export function useTelemetry(nodeId = 'node_1') {
  const [data, setData] = useState(null);
  useEffect(() => subscribeTelemetry(nodeId, setData), [nodeId]);
  return data;
}

/** Seluruh node sensor (peta, kamera, kesehatan node). */
export function useNodes() {
  const [nodes, setNodes] = useState([]);
  useEffect(() => subscribeNodes(setNodes), []);
  return nodes;
}

/** Riwayat alert + jumlah belum dibaca (badge sidebar). */
export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => subscribeAlerts(setAlerts), []);
  return { alerts, unread: alerts.filter((a) => !a.read).length };
}
