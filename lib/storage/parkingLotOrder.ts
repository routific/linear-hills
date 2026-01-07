import { z } from "zod";
import { getFromStorage, setToStorage } from "./index";
import { STORAGE_KEYS, ParkingLotOrderSchema } from "./schemas";
import type { ParkingLotOrder } from "@/types";

const ParkingLotOrdersArraySchema = z.array(ParkingLotOrderSchema);

export function getParkingLotOrders(): ParkingLotOrder[] {
  const orders = getFromStorage<ParkingLotOrder[]>(
    STORAGE_KEYS.PARKING_LOT_ORDER,
    ParkingLotOrdersArraySchema
  );
  return orders || [];
}

export function setParkingLotOrders(orders: ParkingLotOrder[]): boolean {
  return setToStorage(STORAGE_KEYS.PARKING_LOT_ORDER, orders);
}

export function getParkingLotOrder(
  projectId: string,
  side: "left" | "right"
): ParkingLotOrder | null {
  const orders = getParkingLotOrders();
  return (
    orders.find((o) => o.projectId === projectId && o.side === side) || null
  );
}

export function updateParkingLotOrder(order: ParkingLotOrder): boolean {
  const orders = getParkingLotOrders();
  const index = orders.findIndex(
    (o) => o.projectId === order.projectId && o.side === order.side
  );

  if (index === -1) {
    orders.push(order);
  } else {
    orders[index] = order;
  }

  return setParkingLotOrders(orders);
}

export function deleteOrdersByProject(projectId: string): boolean {
  const orders = getParkingLotOrders();
  const filtered = orders.filter((o) => o.projectId !== projectId);
  return setParkingLotOrders(filtered);
}
