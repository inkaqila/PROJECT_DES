from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# DES standard permutation tables
IP = [58, 50, 42, 34, 26, 18, 10, 2,
      60, 52, 44, 36, 28, 20, 12, 4,
      62, 54, 46, 38, 30, 22, 14, 6,
      64, 56, 48, 40, 32, 24, 16, 8,
      57, 49, 41, 33, 25, 17, 9, 1,
      59, 51, 43, 35, 27, 19, 11, 3,
      61, 53, 45, 37, 29, 21, 13, 5,
      63, 55, 47, 39, 31, 23, 15, 7]

IP_INV = [40, 8, 48, 16, 56, 24, 64, 32,
          39, 7, 47, 15, 55, 23, 63, 31,
          38, 6, 46, 14, 54, 22, 62, 30,
          37, 5, 45, 13, 53, 21, 61, 29,
          36, 4, 44, 12, 52, 20, 60, 28,
          35, 3, 43, 11, 51, 19, 59, 27,
          34, 2, 42, 10, 50, 18, 58, 26,
          33, 1, 41, 9, 49, 17, 57, 25]

PC1 = [57, 49, 41, 33, 25, 17, 9,
       1, 58, 50, 42, 34, 26, 18,
       10, 2, 59, 51, 43, 35, 27,
       19, 11, 3, 60, 52, 44, 36,
       63, 55, 47, 39, 31, 23, 15,
       7, 62, 54, 46, 38, 30, 22,
       14, 6, 61, 53, 45, 37, 29,
       21, 13, 5, 28, 20, 12, 4]

PC2 = [14, 17, 11, 24, 1, 5,
       3, 28, 15, 6, 21, 10,
       23, 19, 12, 4, 26, 8,
       16, 7, 27, 20, 13, 2,
       41, 52, 31, 37, 47, 55,
       30, 40, 51, 45, 33, 48,
       44, 49, 39, 56, 34, 53,
       46, 42, 50, 36, 29, 32]

SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1]

E = [32, 1, 2, 3, 4, 5,
     4, 5, 6, 7, 8, 9,
     8, 9, 10, 11, 12, 13,
     12, 13, 14, 15, 16, 17,
     16, 17, 18, 19, 20, 21,
     20, 21, 22, 23, 24, 25,
     24, 25, 26, 27, 28, 29,
     28, 29, 30, 31, 32, 1]

P = [16, 7, 20, 21,
     29, 12, 28, 17,
     1, 15, 23, 26,
     5, 18, 31, 10,
     2, 8, 24, 14,
     32, 27, 3, 9,
     19, 13, 30, 6,
     22, 11, 4, 25]

S_BOXES = [
    [[14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
     [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
     [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
     [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]],
    [[15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
     [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
     [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
     [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]],
    [[10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
     [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
     [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
     [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]],
    [[7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
     [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
     [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
     [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]],
    [[2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
     [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
     [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
     [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]],
    [[12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
     [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
     [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
     [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]],
    [[4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
     [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
     [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
     [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]],
    [[13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
     [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
     [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
     [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]],
]


def permute(bits, table):
    return ''.join(bits[i - 1] for i in table)


def left_shift(bits, n):
    return bits[n:] + bits[:n]


def xor_bits(a, b):
    return ''.join('0' if x == y else '1' for x, y in zip(a, b))


def bin_to_hex(bits):
    return hex(int(bits, 2))[2:].upper().zfill(len(bits) // 4)


def hex_to_bin(hex_text, bit_length):
    return bin(int(hex_text, 16))[2:].zfill(bit_length)


def normalize_input(value, expected_bits):
    value = value.strip().replace(' ', '').upper()
    if all(c in '01' for c in value) and len(value) == expected_bits:
        return value, bin_to_hex(value)
    expected_hex = expected_bits // 4
    if all(c in '0123456789ABCDEF' for c in value) and len(value) == expected_hex:
        bits = hex_to_bin(value, expected_bits)
        return bits, value
    raise ValueError(f'Input harus berupa {expected_bits}-bit biner atau {expected_hex} digit heksadesimal.')


def generate_subkeys(key_bits):
    pc1 = permute(key_bits, PC1)
    c = pc1[:28]
    d = pc1[28:]
    subkeys = []
    rounds = []
    for idx, shift in enumerate(SHIFTS, start=1):
        c = left_shift(c, shift)
        d = left_shift(d, shift)
        cd = c + d
        k = permute(cd, PC2)
        subkeys.append(k)
        rounds.append({
            'round': idx,
            'shift': shift,
            'c': c,
            'd': d,
            'cd': cd,
            'key_bin': k,
            'key_hex': bin_to_hex(k)
        })
    return {
        'pc1_bin': pc1,
        'pc1_hex': bin_to_hex(pc1),
        'c0': pc1[:28],
        'd0': pc1[28:],
        'c0_hex': bin_to_hex(pc1[:28]),
        'd0_hex': bin_to_hex(pc1[28:]),
        'subkeys': subkeys,
        'rounds': rounds
    }


def sbox_substitution(bits48):
    output = ''
    details = []
    for i in range(8):
        block = bits48[i * 6:(i + 1) * 6]
        row_bits = block[0] + block[5]
        col_bits = block[1:5]
        row = int(row_bits, 2)
        col = int(col_bits, 2)
        value = S_BOXES[i][row][col]
        out4 = bin(value)[2:].zfill(4)
        output += out4
        details.append({
            'sbox': f'S{i + 1}',
            'input': block,
            'row_bits': row_bits,
            'col_bits': col_bits,
            'row': row,
            'col': col,
            'value': value,
            'output': out4
        })
    return output, details


def feistel_function(r_bits, subkey):
    expanded = permute(r_bits, E)
    xor_result = xor_bits(expanded, subkey)
    sbox_output, sbox_details = sbox_substitution(xor_result)
    p_output = permute(sbox_output, P)
    return {
        'expanded_bin': expanded,
        'expanded_hex': bin_to_hex(expanded),
        'xor_bin': xor_result,
        'xor_hex': bin_to_hex(xor_result),
        'sbox_output_bin': sbox_output,
        'sbox_output_hex': bin_to_hex(sbox_output),
        'sbox_details': sbox_details,
        'p_output_bin': p_output,
        'p_output_hex': bin_to_hex(p_output)
    }


def run_des(input_value, key_value, mode):
    text_bits, text_hex = normalize_input(input_value, 64)
    key_bits, key_hex = normalize_input(key_value, 64)

    key_schedule = generate_subkeys(key_bits)
    keys_for_round = key_schedule['subkeys'] if mode == 'enc' else list(reversed(key_schedule['subkeys']))

    ip_bits = permute(text_bits, IP)
    l = ip_bits[:32]
    r = ip_bits[32:]

    rounds = []
    for i in range(16):
        subkey = keys_for_round[i]
        original_l = l
        original_r = r
        f = feistel_function(original_r, subkey)
        new_l = original_r
        new_r = xor_bits(original_l, f['p_output_bin'])
        rounds.append({
            'round': i + 1,
            'subkey_bin': subkey,
            'subkey_hex': bin_to_hex(subkey),
            'l_before_bin': original_l,
            'l_before_hex': bin_to_hex(original_l),
            'r_before_bin': original_r,
            'r_before_hex': bin_to_hex(original_r),
            'expanded_bin': f['expanded_bin'],
            'expanded_hex': f['expanded_hex'],
            'xor_bin': f['xor_bin'],
            'xor_hex': f['xor_hex'],
            'sbox_output_bin': f['sbox_output_bin'],
            'sbox_output_hex': f['sbox_output_hex'],
            'sbox_details': f['sbox_details'],
            'p_output_bin': f['p_output_bin'],
            'p_output_hex': f['p_output_hex'],
            'l_after_bin': new_l,
            'l_after_hex': bin_to_hex(new_l),
            'r_after_bin': new_r,
            'r_after_hex': bin_to_hex(new_r)
        })
        l, r = new_l, new_r

    preoutput = r + l  # final swap R16 + L16
    output_bits = permute(preoutput, IP_INV)

    return {
        'mode': mode,
        'input_bin': text_bits,
        'input_hex': text_hex,
        'key_bin': key_bits,
        'key_hex': key_hex,
        'result_bin': output_bits,
        'result_hex': bin_to_hex(output_bits),
        'key_schedule': key_schedule,
        'ip_bin': ip_bits,
        'ip_hex': bin_to_hex(ip_bits),
        'l0_bin': ip_bits[:32],
        'l0_hex': bin_to_hex(ip_bits[:32]),
        'r0_bin': ip_bits[32:],
        'r0_hex': bin_to_hex(ip_bits[32:]),
        'rounds': rounds,
        'preoutput_bin': preoutput,
        'preoutput_hex': bin_to_hex(preoutput),
        'ip_inv_bin': output_bits,
        'ip_inv_hex': bin_to_hex(output_bits)
    }


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/des', methods=['POST'])
def api_des():
    try:
        payload = request.get_json(force=True)
        input_value = payload.get('text', '')
        key_value = payload.get('key', '')
        mode = payload.get('mode', 'enc')
        if mode not in ['enc', 'dec']:
            return jsonify({'success': False, 'message': 'Mode harus enc atau dec.'}), 400
        result = run_des(input_value, key_value, mode)
        return jsonify({'success': True, 'data': result})
    except Exception as exc:
        return jsonify({'success': False, 'message': str(exc)}), 400


if __name__ == '__main__':
    app.run(debug=True)
