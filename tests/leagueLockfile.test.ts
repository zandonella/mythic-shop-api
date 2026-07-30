import assert from 'node:assert/strict';
import test from 'node:test';
import { parseLeagueLockfile } from '../lib/leagueLockfile.js';

test('parses valid League client credentials', () => {
    assert.deepEqual(
        parseLeagueLockfile('LeagueClient:1234:5678:secret-token:https'),
        {
            processId: 1234,
            port: 5678,
            password: 'secret-token',
        },
    );
});

test('accepts trailing Windows line endings', () => {
    assert.deepEqual(
        parseLeagueLockfile('LeagueClient:1234:5678:secret-token:https\r\n'),
        {
            processId: 1234,
            port: 5678,
            password: 'secret-token',
        },
    );
});

test('rejects malformed lockfile content', () => {
    assert.throws(
        () => parseLeagueLockfile('RiotClient:1234:5678:secret-token:https'),
        /unexpected format/,
    );
});
