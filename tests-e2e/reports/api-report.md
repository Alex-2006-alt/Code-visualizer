# CodeTrace Backend API Corpus Test Report

- **Date & Time:** 2026-10-30 03:17:12 UTC
- **Total Tests Executed:** 80
- **Passed:** 80 / 80 (100.0%)
- **Failed:** 0
- **Docker Sandbox Status:** Docker CLI not installed on host (running in Subprocess sandbox fallback mode).

## Category Summary

| Category | Total | Passed | Failed | Pass Rate |
| :--- | :---: | :---: | :---: | :---: |
| `A_basics` | 8 | 8 | 0 | 100.0% |
| `B_data_structures` | 10 | 10 | 0 | 100.0% |
| `C_algorithms` | 12 | 12 | 0 | 100.0% |
| `D_recursion` | 8 | 8 | 0 | 100.0% |
| `E_dp_graphs` | 6 | 6 | 0 | 100.0% |
| `F_classes_references` | 8 | 8 | 0 | 100.0% |
| `G_other_features` | 6 | 6 | 0 | 100.0% |
| `H_messy_code` | 6 | 6 | 0 | 100.0% |
| `I_expected_failures` | 10 | 10 | 0 | 100.0% |
| `J_abuse_limits` | 6 | 6 | 0 | 100.0% |

## Detailed Test Results Table

| # | Program | Category | Expected | Actual | Status | Steps | Latency (ms) | Result |
| :-: | :--- | :--- | :---: | :---: | :-: | :-: | :-: | :-: |
| 1 | `a01_variable_assignment` | `A_basics` | `ok` | `ok` | 200 | 8 | 1175.4 | PASS |
| 2 | `a02_arithmetic` | `A_basics` | `ok` | `ok` | 200 | 12 | 182.37 | PASS |
| 3 | `a03_strings` | `A_basics` | `ok` | `ok` | 200 | 9 | 162.4 | PASS |
| 4 | `a04_fstrings` | `A_basics` | `ok` | `ok` | 200 | 8 | 155.1 | PASS |
| 5 | `a05_if_else` | `A_basics` | `ok` | `ok` | 200 | 9 | 161.0 | PASS |
| 6 | `a06_for_loop` | `A_basics` | `ok` | `ok` | 200 | 15 | 156.34 | PASS |
| 7 | `a07_while_loop` | `A_basics` | `ok` | `ok` | 200 | 22 | 164.61 | PASS |
| 8 | `a08_print_only` | `A_basics` | `ok` | `ok` | 200 | 5 | 185.8 | PASS |
| 9 | `b01_list_operations` | `B_data_structures` | `ok` | `ok` | 200 | 8 | 198.45 | PASS |
| 10 | `b02_dict_operations` | `B_data_structures` | `ok` | `ok` | 200 | 8 | 173.9 | PASS |
| 11 | `b03_set_operations` | `B_data_structures` | `ok` | `ok` | 200 | 9 | 189.82 | PASS |
| 12 | `b04_tuple_unpacking` | `B_data_structures` | `ok` | `ok` | 200 | 7 | 179.27 | PASS |
| 13 | `b05_nested_lists` | `B_data_structures` | `ok` | `ok` | 200 | 22 | 174.3 | PASS |
| 14 | `b06_list_comprehension` | `B_data_structures` | `ok` | `ok` | 200 | 21 | 150.72 | PASS |
| 15 | `b07_dict_comprehension` | `B_data_structures` | `ok` | `ok` | 200 | 8 | 154.24 | PASS |
| 16 | `b08_stack` | `B_data_structures` | `ok` | `ok` | 200 | 13 | 163.37 | PASS |
| 17 | `b09_queue_deque` | `B_data_structures` | `ok` | `ok` | 200 | 9 | 153.27 | PASS |
| 18 | `b10_heap_heapq` | `B_data_structures` | `ok` | `ok` | 200 | 18 | 178.97 | PASS |
| 19 | `c01_bubble_sort` | `C_algorithms` | `ok` | `ok` | 200 | 44 | 166.11 | PASS |
| 20 | `c02_selection_sort` | `C_algorithms` | `ok` | `ok` | 200 | 52 | 174.72 | PASS |
| 21 | `c03_insertion_sort` | `C_algorithms` | `ok` | `ok` | 200 | 49 | 180.4 | PASS |
| 22 | `c04_merge_sort` | `C_algorithms` | `ok` | `ok` | 200 | 156 | 201.66 | PASS |
| 23 | `c05_quick_sort` | `C_algorithms` | `ok` | `ok` | 200 | 101 | 204.59 | PASS |
| 24 | `c06_binary_search` | `C_algorithms` | `ok` | `ok` | 200 | 43 | 162.1 | PASS |
| 25 | `c07_two_sum` | `C_algorithms` | `ok` | `ok` | 200 | 15 | 202.74 | PASS |
| 26 | `c08_sliding_window` | `C_algorithms` | `ok` | `ok` | 200 | 21 | 136.05 | PASS |
| 27 | `c09_prefix_sum` | `C_algorithms` | `ok` | `ok` | 200 | 21 | 145.56 | PASS |
| 28 | `c10_gcd` | `C_algorithms` | `ok` | `ok` | 200 | 23 | 148.75 | PASS |
| 29 | `c11_prime_sieve` | `C_algorithms` | `ok` | `ok` | 200 | 100 | 159.16 | PASS |
| 30 | `c12_matrix_traversal` | `C_algorithms` | `ok` | `ok` | 200 | 28 | 159.66 | PASS |
| 31 | `d01_factorial` | `D_recursion` | `ok` | `ok` | 200 | 24 | 157.57 | PASS |
| 32 | `d02_fibonacci` | `D_recursion` | `ok` | `ok` | 200 | 201 | 161.58 | PASS |
| 33 | `d03_power` | `D_recursion` | `ok` | `ok` | 200 | 36 | 150.14 | PASS |
| 34 | `d04_sum_list` | `D_recursion` | `ok` | `ok` | 200 | 28 | 163.85 | PASS |
| 35 | `d05_permutations` | `D_recursion` | `ok` | `ok` | 200 | 94 | 165.05 | PASS |
| 36 | `d06_subsets` | `D_recursion` | `ok` | `ok` | 200 | 70 | 158.15 | PASS |
| 37 | `d07_tower_of_hanoi` | `D_recursion` | `ok` | `ok` | 200 | 73 | 134.17 | PASS |
| 38 | `d08_recursion_depth_50` | `D_recursion` | `ok` | `ok` | 200 | 188 | 182.87 | PASS |
| 39 | `e01_fibonacci_memo` | `E_dp_graphs` | `ok` | `ok` | 200 | 122 | 185.12 | PASS |
| 40 | `e02_climbing_stairs` | `E_dp_graphs` | `ok` | `ok` | 200 | 24 | 220.56 | PASS |
| 41 | `e03_knapsack_small` | `E_dp_graphs` | `ok` | `ok` | 200 | 73 | 208.95 | PASS |
| 42 | `e04_bfs` | `E_dp_graphs` | `ok` | `ok` | 200 | 63 | 187.99 | PASS |
| 43 | `e05_dfs` | `E_dp_graphs` | `ok` | `ok` | 200 | 63 | 245.11 | PASS |
| 44 | `e06_shortest_path_graph` | `E_dp_graphs` | `ok` | `ok` | 200 | 76 | 203.39 | PASS |
| 45 | `f01_simple_class` | `F_classes_references` | `ok` | `ok` | 200 | 17 | 226.66 | PASS |
| 46 | `f02_linked_list_reverse` | `F_classes_references` | `ok` | `ok` | 200 | 50 | 154.09 | PASS |
| 47 | `f03_binary_tree_traversal` | `F_classes_references` | `ok` | `ok` | 200 | 85 | 144.34 | PASS |
| 48 | `f04_shared_references` | `F_classes_references` | `ok` | `ok` | 200 | 6 | 153.18 | PASS |
| 49 | `f05_mutable_default_arg` | `F_classes_references` | `ok` | `ok` | 200 | 14 | 171.77 | PASS |
| 50 | `f06_nested_objects` | `F_classes_references` | `ok` | `ok` | 200 | 21 | 188.47 | PASS |
| 51 | `f07_repr_methods` | `F_classes_references` | `ok` | `ok` | 200 | 17 | 187.07 | PASS |
| 52 | `f08_inheritance` | `F_classes_references` | `ok` | `ok` | 200 | 26 | 189.28 | PASS |
| 53 | `g01_generator` | `G_other_features` | `ok` | `ok` | 200 | 25 | 171.89 | PASS |
| 54 | `g02_lambda_map_filter` | `G_other_features` | `ok` | `ok` | 200 | 33 | 201.26 | PASS |
| 55 | `g03_try_except_finally` | `G_other_features` | `ok` | `ok` | 200 | 9 | 169.09 | PASS |
| 56 | `g04_closures` | `G_other_features` | `ok` | `ok` | 200 | 20 | 158.58 | PASS |
| 57 | `g05_global_vs_local` | `G_other_features` | `ok` | `ok` | 200 | 13 | 164.27 | PASS |
| 58 | `g06_string_formatting` | `G_other_features` | `ok` | `ok` | 200 | 8 | 166.29 | PASS |
| 59 | `h01_bad_indentation` | `H_messy_code` | `ok` | `ok` | 200 | 11 | 142.88 | PASS |
| 60 | `h02_unused_variables` | `H_messy_code` | `ok` | `ok` | 200 | 18 | 166.37 | PASS |
| 61 | `h03_long_lines` | `H_messy_code` | `ok` | `ok` | 200 | 83 | 175.02 | PASS |
| 62 | `h04_unicode_emoji` | `H_messy_code` | `ok` | `ok` | 200 | 6 | 170.61 | PASS |
| 63 | `h05_tabs_vs_spaces` | `H_messy_code` | `ok` | `ok` | 200 | 21 | 179.01 | PASS |
| 64 | `h06_crlf_endings` | `H_messy_code` | `ok` | `ok` | 200 | 6 | 173.92 | PASS |
| 65 | `i01_syntax_error` | `I_expected_failures` | `exception` | `exception` | 400 | 0 | 171.96 | PASS |
| 66 | `i02_name_error` | `I_expected_failures` | `exception` | `exception` | 200 | 6 | 376.9 | PASS |
| 67 | `i03_zero_division` | `I_expected_failures` | `exception` | `exception` | 200 | 7 | 176.71 | PASS |
| 68 | `i04_index_error` | `I_expected_failures` | `exception` | `exception` | 200 | 6 | 148.16 | PASS |
| 69 | `i05_key_error` | `I_expected_failures` | `exception` | `exception` | 200 | 6 | 155.1 | PASS |
| 70 | `i06_infinite_loop` | `I_expected_failures` | `timeout` | `truncated` | 200 | 2000 | 190.02 | PASS |
| 71 | `i07_long_loop_over_2000` | `I_expected_failures` | `truncated` | `truncated` | 200 | 2000 | 1111.18 | PASS |
| 72 | `i08_huge_output` | `I_expected_failures` | `ok` | `ok` | 200 | 403 | 370.56 | PASS |
| 73 | `i09_forbidden_import` | `I_expected_failures` | `blocked` | `blocked` | 400 | 0 | 5.96 | PASS |
| 74 | `i10_file_open_access` | `I_expected_failures` | `exception` | `exception` | 200 | 5 | 216.97 | PASS |
| 75 | `j01_memory_bomb` | `J_abuse_limits` | `timeout` | `timeout` | 408 | 0 | 5104.15 | PASS |
| 76 | `j02_fork_bomb` | `J_abuse_limits` | `blocked` | `blocked` | 400 | 0 | 296.09 | PASS |
| 77 | `j03_deeply_nested_data` | `J_abuse_limits` | `ok` | `ok` | 200 | 66 | 360.95 | PASS |
| 78 | `j04_code_10kb_exact` | `J_abuse_limits` | `ok` | `ok` | 200 | 4 | 248.34 | PASS |
| 79 | `j05_code_over_10kb` | `J_abuse_limits` | `blocked` | `blocked` | 400 | 0 | 6.1 | PASS |
| 80 | `j06_empty_code` | `J_abuse_limits` | `blocked` | `blocked` | 400 | 0 | 5.12 | PASS |