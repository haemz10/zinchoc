-- Appearance round: owner-editable brand colours and section visibility
-- toggles. Additive seeds only; defaults equal the shipped design.

INSERT OR IGNORE INTO settings (key, value) VALUES ('color_ground', '#f3eee5');
INSERT OR IGNORE INTO settings (key, value) VALUES ('color_panel', '#eae3d5');
INSERT OR IGNORE INTO settings (key, value) VALUES ('color_ink', '#1c3040');
INSERT OR IGNORE INTO settings (key, value) VALUES ('color_gold', '#a9853e');
INSERT OR IGNORE INTO settings (key, value) VALUES ('color_silver', '#b9bcc2');

INSERT OR IGNORE INTO settings (key, value) VALUES ('show_story', '1');
INSERT OR IGNORE INTO settings (key, value) VALUES ('show_process', '1');
INSERT OR IGNORE INTO settings (key, value) VALUES ('show_gallery', '1');
INSERT OR IGNORE INTO settings (key, value) VALUES ('show_collection_wedding', '1');
INSERT OR IGNORE INTO settings (key, value) VALUES ('show_collection_art', '1');
