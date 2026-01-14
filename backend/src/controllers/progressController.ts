import { Request, Response } from 'express';
import prisma from '../db/client';

/**
 * Контроллер измерений и прогресса
 */
export class ProgressController {
  /**
   * GET /api/measurements - получить все измерения
   */
  static async getMeasurements(req: Request, res: Response) {
    try {
      const profile = await prisma.userProfile.findFirst();
      if (!profile) {
        return res.status(404).json({ error: 'Профиль не найден' });
      }

      const measurements = await prisma.bodyMeasurement.findMany({
        where: { userProfileId: profile.id },
        orderBy: { date: 'asc' },
      });

      const measurementsDTO = measurements.map(m => ({
        id: m.id,
        date: m.date,
        weightKg: m.weightKg,
        waistCm: m.waistCm,
        chestCm: m.chestCm,
        hipsCm: m.hipsCm,
        notes: m.notes,
        createdAt: m.createdAt,
      }));

      res.json(measurementsDTO);
    } catch (error) {
      console.error('Ошибка получения измерений:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * POST /api/measurements - добавить новое измерение
   */
  static async addMeasurement(req: Request, res: Response) {
    try {
      const { date, weightKg, waistCm, chestCm, hipsCm, notes }: {
        date: string;
        weightKg: number;
        waistCm?: number;
        chestCm?: number;
        hipsCm?: number;
        notes?: string;
      } = req.body;

      if (!date || !weightKg) {
        return res.status(400).json({ error: 'Не заполнены обязательные поля' });
      }

      const profile = await prisma.userProfile.findFirst();
      if (!profile) {
        return res.status(404).json({ error: 'Профиль не найден' });
      }

      // Проверяем, нет ли уже измерения на эту дату
      const existing = await prisma.bodyMeasurement.findFirst({
        where: {
          userProfileId: profile.id,
          date,
        },
      });

      if (existing) {
        // Обновляем существующее
        const updated = await prisma.bodyMeasurement.update({
          where: { id: existing.id },
          data: {
            weightKg,
            waistCm: waistCm || null,
            chestCm: chestCm || null,
            hipsCm: hipsCm || null,
            notes: notes || null,
          },
        });

        return res.json({
          id: updated.id,
          date: updated.date,
          weightKg: updated.weightKg,
          waistCm: updated.waistCm,
          chestCm: updated.chestCm,
          hipsCm: updated.hipsCm,
          notes: updated.notes,
          createdAt: updated.createdAt,
        });
      }

      // Создаём новое измерение
      const measurement = await prisma.bodyMeasurement.create({
        data: {
          userProfileId: profile.id,
          date,
          weightKg,
          waistCm: waistCm || null,
          chestCm: chestCm || null,
          hipsCm: hipsCm || null,
          notes: notes || null,
        },
      });

      res.status(201).json({
        id: measurement.id,
        date: measurement.date,
        weightKg: measurement.weightKg,
        waistCm: measurement.waistCm,
        chestCm: measurement.chestCm,
        hipsCm: measurement.hipsCm,
        notes: measurement.notes,
        createdAt: measurement.createdAt,
      });
    } catch (error) {
      console.error('Ошибка добавления измерения:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * DELETE /api/measurements/:id - удалить измерение
   */
  static async deleteMeasurement(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const measurement = await prisma.bodyMeasurement.findUnique({
        where: { id },
      });

      if (!measurement) {
        return res.status(404).json({ error: 'Измерение не найдено' });
      }

      await prisma.bodyMeasurement.delete({
        where: { id },
      });

      res.json({ message: 'Измерение удалено' });
    } catch (error) {
      console.error('Ошибка удаления измерения:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}
