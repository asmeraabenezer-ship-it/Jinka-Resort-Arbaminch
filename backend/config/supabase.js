const fs = require('fs');
const path = require('path');

const TABLE_FILES = {
  'users': 'users.json',
  'rooms': 'rooms.json',
  'bookings': 'bookings.json',
  'menu': 'menu_items.json',
  'menu_items': 'menu_items.json',
  'orders': 'orders.json',
  'order_items': 'order_items.json',
  'logs': 'logs.json'
};

class MockQuery {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.orderBy = null;
    this.limitVal = null;
    this.isSingle = false;
    this.action = 'select'; // select, insert, update, delete
    this.actionData = null;
    this.selectFields = '*';
  }

  select(fields = '*') {
    if (this.action !== 'insert' && this.action !== 'update' && this.action !== 'delete') {
      this.action = 'select';
    }
    this.selectFields = fields;
    return this;
  }

  insert(data) {
    this.action = 'insert';
    this.actionData = data;
    return this;
  }

  update(data) {
    this.action = 'update';
    this.actionData = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(field, value) {
    this.filters.push({ field, value });
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  order(field, options = {}) {
    this.orderBy = { field, ascending: options.ascending !== false };
    return this;
  }

  limit(n) {
    this.limitVal = n;
    return this;
  }

  // Make the Query Builder Thenable (Promise-compatible)
  async then(onfulfilled, onrejected) {
    try {
      const res = await this.execute();
      if (onfulfilled) return onfulfilled(res);
      return res;
    } catch (err) {
      const errorRes = { data: null, error: err };
      if (onfulfilled) return onfulfilled(errorRes);
      return errorRes;
    }
  }

  async execute() {
    const dataDir = path.join(__dirname, '../data');
    const fileName = TABLE_FILES[this.table];
    if (!fileName) {
      throw new Error(`Table ${this.table} is not mapped to a local file.`);
    }
    const filePath = path.join(dataDir, fileName);

    // Make sure directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let items = [];
    if (fs.existsSync(filePath)) {
      try {
        items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (err) {
        console.error(`Error reading database file ${filePath}:`, err);
        items = [];
      }
    }

    if (this.action === 'select') {
      let result = [...items];
      for (const filter of this.filters) {
        result = result.filter(item => {
          const val = item[filter.field];
          return String(val) === String(filter.value);
        });
      }

      // Populate relations
      if (this.selectFields !== '*') {
        result = result.map(item => this.populateRelations(item, this.selectFields, dataDir));
      }

      // Order
      if (this.orderBy) {
        const { field, ascending } = this.orderBy;
        result.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (valA < valB) return ascending ? -1 : 1;
          if (valA > valB) return ascending ? 1 : -1;
          return 0;
        });
      }

      // Limit
      if (this.limitVal !== null) {
        result = result.slice(0, this.limitVal);
      }

      if (this.isSingle) {
        return { data: result[0] || null, error: null };
      }
      return { data: result, error: null };

    } else if (this.action === 'insert') {
      const recordsToInsert = Array.isArray(this.actionData) ? this.actionData : [this.actionData];
      const inserted = [];

      for (const record of recordsToInsert) {
        const newRecord = {
          id: record.id || `uuid-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
          created_at: record.created_at || new Date().toISOString(),
          ...record
        };
        items.push(newRecord);
        inserted.push(newRecord);
      }

      fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');

      if (this.isSingle) {
        return { data: inserted[0], error: null };
      }
      return { data: Array.isArray(this.actionData) ? inserted : inserted[0], error: null };

    } else if (this.action === 'update') {
      const updatedData = [];

      items = items.map(item => {
        let matches = true;
        for (const filter of this.filters) {
          if (String(item[filter.field]) !== String(filter.value)) {
            matches = false;
          }
        }
        if (matches) {
          const updatedItem = { ...item, ...this.actionData };
          updatedData.push(updatedItem);
          return updatedItem;
        }
        return item;
      });

      fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');

      if (this.isSingle) {
        return { data: updatedData[0] || null, error: null };
      }
      return { data: updatedData, error: null };

    } else if (this.action === 'delete') {
      const remainingItems = [];
      const deletedData = [];

      for (const item of items) {
        let matches = true;
        for (const filter of this.filters) {
          if (String(item[filter.field]) !== String(filter.value)) {
            matches = false;
          }
        }
        if (matches) {
          deletedData.push(item);
        } else {
          remainingItems.push(item);
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(remainingItems, null, 2), 'utf8');
      return { data: deletedData, error: null };
    }
  }

  populateRelations(item, selectString, dataDir) {
    const populated = { ...item };
    
    // Parse standard joins
    if (selectString.includes('user:users') || selectString.includes('user(*')) {
      const usersFile = path.join(dataDir, 'users.json');
      if (fs.existsSync(usersFile)) {
        const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        const userId = item.user_id || item.user;
        populated.user = users.find(u => u.id === userId) || null;
      }
    }

    if (selectString.includes('room:rooms') || selectString.includes('room(*')) {
      const roomsFile = path.join(dataDir, 'rooms.json');
      if (fs.existsSync(roomsFile)) {
        const rooms = JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
        const roomId = item.room_id || item.room;
        populated.room = rooms.find(r => r.id === roomId) || null;
      }
    }

    if (selectString.includes('order_items')) {
      const orderItemsFile = path.join(dataDir, 'order_items.json');
      if (fs.existsSync(orderItemsFile)) {
        const orderItems = JSON.parse(fs.readFileSync(orderItemsFile, 'utf8'));
        const menuItemsFile = path.join(dataDir, 'menu_items.json');
        const menuItems = fs.existsSync(menuItemsFile) ? JSON.parse(fs.readFileSync(menuItemsFile, 'utf8')) : [];
        
        const items = orderItems.filter(oi => oi.order_id === item.id);
        populated.order_items = items.map(oi => {
          const menuItemId = oi.menu_item_id || oi.menuItem;
          const menu_items = menuItems.find(mi => mi.id === menuItemId) || null;
          return {
            ...oi,
            menu_items
          };
        });
      }
    }

    return populated;
  }
}

class MockSupabase {
  from(table) {
    return new MockQuery(table);
  }
}

const supabase = new MockSupabase();

module.exports = supabase;
