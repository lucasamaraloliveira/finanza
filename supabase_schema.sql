-- TABELA DE CATEGORIAS
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  hex TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABELA DE TRANSAÇÕES
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('INCOME', 'EXPENSE')),
  category TEXT REFERENCES categories(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  card_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABELA DE ORÇAMENTOS
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT REFERENCES categories(id) ON DELETE CASCADE,
  "limit" NUMERIC NOT NULL,
  UNIQUE(category)
);

-- TABELA DE METAS E INVESTIMENTOS
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline DATE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABELA DE CARTÕES DE CRÉDITO
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "limit" NUMERIC NOT NULL,
  closing_day INTEGER CHECK (closing_day BETWEEN 1 AND 31),
  due_day INTEGER CHECK (due_day BETWEEN 1 AND 31),
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABELA DE BENEFÍCIOS (VOUCHERS)
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('VA', 'VR')),
  balance NUMERIC DEFAULT 0,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRANSAÇÕES DE BENEFÍCIOS
CREATE TABLE voucher_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('CREDIT', 'DEBIT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRANSAÇÕES RECORRENTES
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT REFERENCES categories(id) ON DELETE SET NULL,
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  type TEXT CHECK (type IN ('INCOME', 'EXPENSE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
