import {
  LevelHierarchy,
  LevelGroupItem,
  LevelItem,
  ComponentItem,
} from "@/types/LevelHierarchy";
import { ContentHierarchyService } from "@/services/ContentHierarchyService";

// Basit SQL komutu listesi döndürür
type DiffDetailed = ReturnType<
  ContentHierarchyService["diffWithBaselineDetailed"]
>;

export function generateSqlFromDiff(
  diff: DiffDetailed,
  currentHierarchy: LevelHierarchy
): string[] {
  const sql: string[] = [];

  // Yardımcı kaçış
  const esc = (val: string) => val.replace(/'/g, "''");

  const json = (obj: any) =>
    `'$${JSON.stringify(obj).replace(/'/g, "''")}$'::jsonb`;

  // --- Silme işlemleri (önce child'lar) ---
  diff.deleted.components.forEach((c) => {
    sql.push(`DELETE FROM components WHERE id = '${esc(c.id)}';`);
  });
  diff.deleted.levels.forEach((l) => {
    // Önce ilerleme kayıtlarını temizle
    sql.push(
      `DELETE FROM user_level_progress WHERE level_id = '${esc(l.id)}';`
    );
    sql.push(`DELETE FROM levels WHERE id = '${esc(l.id)}';`);
  });
  diff.deleted.groups.forEach((g) => {
    sql.push(`DELETE FROM level_groups WHERE id = '${esc(g.id)}';`);
  });

  // --- Ekleme işlemleri ---
  diff.added.groups.forEach((g) => {
    sql.push(
      `INSERT INTO level_groups (id, title, "order") VALUES ('${esc(
        g.id
      )}', '${esc(g.title)}', ${g.order});`
    );
  });

  const findGroupId = (level: LevelItem): string | null => {
    for (const grp of currentHierarchy) {
      if (grp.levels.some((l) => l.id === level.id)) return grp.id;
    }
    return null;
  };

  diff.added.levels.forEach((l) => {
    const groupId = findGroupId(l);
    if (!groupId) return;
    sql.push(
      `INSERT INTO levels (id, group_id, title, icon_key, icon_family, xp_reward, "order") VALUES ('${esc(
        l.id
      )}', '${esc(groupId)}', '${esc(l.title)}', ${
        l.icon_key ? `'${esc(l.icon_key)}'` : "NULL"
      }, ${l.icon_family ? `'${esc(l.icon_family)}'` : "NULL"}, ${
        l.xp_reward
      }, ${l.order});`
    );
  });

  const findLevelId = (component: ComponentItem): string | null => {
    for (const grp of currentHierarchy) {
      for (const lvl of grp.levels) {
        if (lvl.components.some((c) => c.id === component.id)) return lvl.id;
      }
    }
    return null;
  };

  diff.added.components.forEach((c) => {
    const levelId = findLevelId(c);
    if (!levelId) return;
    sql.push(
      `INSERT INTO components (id, level_id, type, content, "order") VALUES ('${esc(
        c.id
      )}', '${esc(levelId)}', '${esc(c.type)}', ${json(c.content)}, ${
        c.order
      });`
    );
  });

  // --- Güncellemeler ---
  const buildUpdate = (
    table: string,
    id: string,
    fields: Record<string, any>
  ) => {
    const assignments = Object.entries(fields)
      .map(([k, v]) => {
        const col = k === "order" ? '"order"' : k;
        if (v === null || v === undefined) return `${col} = NULL`;
        if (typeof v === "number") return `${col} = ${v}`;
        if (typeof v === "object") return `${col} = ${json(v)}`;
        return `${col} = '${esc(v.toString())}'`;
      })
      .join(", ");
    if (assignments.length === 0) return;
    sql.push(`UPDATE ${table} SET ${assignments} WHERE id = '${esc(id)}';`);
  };

  diff.updated.groups.forEach(({ after, changedFields }) => {
    buildUpdate("level_groups", after.id, changedFields);
  });

  diff.updated.levels.forEach(({ after, changedFields }) => {
    buildUpdate("levels", after.id, changedFields);
  });

  diff.updated.components.forEach(({ after, changedFields }) => {
    buildUpdate("components", after.id, changedFields);
  });

  return sql;
}
